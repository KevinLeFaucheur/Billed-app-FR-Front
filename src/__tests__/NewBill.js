/**
 * @jest-environment jsdom
 */

import { fireEvent, waitFor, getAllByTestId, screen } from "@testing-library/dom"
import "@testing-library/jest-dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"

import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import router from "../app/Router.js";

import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

describe("Given I am connected as an employee", () => {
  describe("When I am navigating to the NewBill Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon).toHaveClass('active-icon')
    })
  })

  // Scénario 11 & 12
  describe("When I try to upload a valid file", () => {
    test("Then the value in input file should match the uploaded file", () => {
      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: localStorageMock })
      // const mockHandleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputFile = screen.getByTestId(`file`)
      // inputFile.addEventListener("change", (event) => mockHandleChangeFile(event))

      const file = new File(
        ["image"], 
        "invalid.jpg", 
        { type: "image/jpeg", }
      )

      // userEvent.upload(inputFile, file)
      fireEvent.change(inputFile, { target: { files: [file], }, })
      
      console.log(expect.getState().currentTestName)

      // expect(mockHandleChangeFile).toHaveBeenCalledTimes(1)
      expect(inputFile.files[0]).toStrictEqual(file)

      // const fileError = document.getElementById('file-error')
      // expect(fileError).not.toBeInTheDocument()
    })
  })

  // Scénario 9
  describe("When I try to upload a invalid file", () => {
    test("Then the File in input file should have no property", () => {
      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: localStorageMock })

      const mockHandleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputFile = screen.getByTestId(`file`)
      // inputFile.value = ''
      inputFile.addEventListener("change", (event) => mockHandleChangeFile(event))

      const file = new File(
        ["image"], 
        "image.gif", 
        { type: "image/gif", }
      );

      // userEvent.upload(inputFile, file);
      fireEvent.change(inputFile, { target: { files: [file], }, })

      console.log(inputFile.files[0].length)

      const fileError = screen.getByTestId('file-error-test')
      expect(fileError).toBeTruthy()

      expect(mockHandleChangeFile).toHaveBeenCalledTimes(1)
      expect(Object.keys(inputFile.files[0]).length).toBe(0)
    })
  })
  
  describe("When I try to submit the new bill", () => {  
    // Scénario 11
    test("Then Newbill.updateBill should have been called once", async () => {
      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: localStorageMock })

      jest.spyOn(newBill, 'updateBill')

      const mockHandleSubmit = jest.fn(newBill.handleSubmit)

      const submitButton = screen.getByRole(`button`)
      // submitButton.addEventListener("change", (event) => mockHandleSubmit(event))

      const inputFile = screen.getByTestId(`file`)

      const file = new File(
        ["image"], 
        "invalid.jpg", 
        { type: "image/jpeg", }
      )
      fireEvent.change(inputFile, { target: { files: [file], }, })

      // Fill all required inputs
      userEvent.type(screen.getByTestId('expense-name'), 'test-submit')
      expect(screen.getByTestId('expense-name').value).toBe('test-submit')

      userEvent.type(screen.getByTestId('datepicker'), '2022-12-25')
      expect(screen.getByTestId('datepicker').value).toBe('2022-12-25')

      userEvent.type(screen.getByTestId('amount'), '249')
      expect(screen.getByTestId('amount').value).toBe('249')

      userEvent.type(screen.getByTestId('pct'), '17')
      expect(screen.getByTestId('pct').value).toBe('17')
      
      fireEvent.submit(screen.getByTestId('form-new-bill'))
      
      await new Promise(process.nextTick)

      expect(newBill.updateBill).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('btn-new-bill')).toBeTruthy()
    })
  })

  // Scénario 15
  describe("When I click on disconnect button", () => {
    test("Then I should be on the Login page", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => document.getElementById('layout-disconnect'))
      const logoutIcon = document.getElementById('layout-disconnect')
      expect(logoutIcon).toBeTruthy()

      userEvent.click(logoutIcon)

      await waitFor(() => screen.getByTestId('form-employee'))
      const formEmployee = screen.getByTestId('form-employee')
      expect(formEmployee).toBeTruthy()
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as Employee, I navigate to NewBill page and I upload a new file", () => {

  beforeEach(() => {
    jest.spyOn(mockStore, "bills")

    Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
    )
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()

    document.body.innerHTML = NewBillUI()

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
  })

  // 
  describe("When no error occurs", () => {
    test("Then Newbill.updateBill should have been called once", () => {

      const file = new File(
        ["image"], 
        "image.jpg", 
        { type: "image/jpeg", }
      )
      
      const inputFile = screen.getByTestId(`file`)
      userEvent.upload(inputFile, file)
      expect(inputFile.files[0]).toStrictEqual(file)
    })
  })

  // Scénario 10
  describe("When an error occurs on API POST (Store.bills().create)", () => {
    test("Then it fails with 404 message error", async () => {

      const logSpy = jest.spyOn(console, 'error')

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : (bill) =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: localStorageMock })

      let mockEvent = {
        target: { value: 'https://localhost:3456/images/test.jpg' },
        preventDefault: jest.fn()
      }
      newBill.handleChangeFile(mockEvent)

      await new Promise(process.nextTick);

      const message = logSpy.mock.calls[0][0].message

      expect(logSpy).toHaveBeenCalledTimes(1)
      expect(message).toMatch(/Erreur 404/)

      logSpy.mockRestore()
    })

    test("Then it fails with 500 message error", async () => {

      const logSpy = jest.spyOn(console, 'error');

      mockStore.bills.mockImplementation(() => {
        return {
          create : (bill) =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: localStorageMock })

      let mockEvent = {
        target: { value: 'https://localhost:3456/images/test.jpg' },
        preventDefault: jest.fn()
      }
      newBill.handleChangeFile(mockEvent)

      await new Promise(process.nextTick);

      console.log(logSpy.mock.calls[0][0].message);
      const message = logSpy.mock.calls[0][0].message

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(message).toMatch(/Erreur 500/);

      logSpy.mockRestore()
    })
  })
})