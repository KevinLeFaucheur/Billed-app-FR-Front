/**
 * @jest-environment jsdom
 */

import { fireEvent, getAllByTestId, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"

import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import router from "../app/Router.js";

import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"


describe("Given I am connected as an employee and I am on NewBill Page", () => {
  describe("When I try to upload a valid file", () => {
    test("Then the value in input file should match the uploaded file", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion'
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
      inputFile.addEventListener("change", (event) => mockHandleChangeFile(event))

      const file = new File(
        ["image"], 
        "image.jpg", 
        { type: "image/jpeg", }
      );

      userEvent.upload(inputFile, file);

      expect(mockHandleChangeFile).toHaveBeenCalledTimes(1)
      expect(inputFile.files[0]).toMatchObject(file)
    })
  })

  describe("When I try to upload a invalid file", () => {
    test("Then the File in input file should have no property", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
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
      inputFile.addEventListener("change", (event) => mockHandleChangeFile(event))

      const file = new File(
        ["image"], 
        "image.gif", 
        { type: "image/gif", }
      );

      userEvent.upload(inputFile, file);

      expect(mockHandleChangeFile).toHaveBeenCalledTimes(1)
      expect(Object.keys(inputFile.files[0]).length).toBe(0)
    })
  })
  
  describe("When I try to submit the new bill", () => {
    test("Then Newbill.updateBill should have been called once", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion

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
      submitButton.addEventListener("change", (event) => mockHandleSubmit(event))

      // Fill all required inputs
      userEvent.type(screen.getByTestId('datepicker'), '2022-12-25')
      expect(screen.getByTestId('datepicker').value).toBe('2022-12-25')

      userEvent.type(screen.getByTestId('amount'), '249')
      expect(screen.getByTestId('amount').value).toBe('249')

      userEvent.type(screen.getByTestId('pct'), '17')
      expect(screen.getByTestId('pct').value).toBe('17')
      
      fireEvent.submit(screen.getByTestId('form-new-bill'));
      expect(newBill.updateBill).toHaveBeenCalledTimes(1)
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as Employee and I navigate to NewBill page", () => {
  describe("When no error occurs", () => {

    test("fetches bills from mock API GET", async () => {
    //   localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
    //   const root = document.createElement("div")
    //   root.setAttribute("id", "root")
    //   document.body.append(root)
    //   router()
    //   window.onNavigate(ROUTES_PATH.Bills)

    //   await waitFor(() => screen.getByText("Mes notes de frais"))

    //   expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
    })
  })

  describe("When an error occurs on API POST (Store.bills().create)", () => {

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

      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
    })

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

    test("fetches bills from an API and fails with 500 message error", async () => {

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