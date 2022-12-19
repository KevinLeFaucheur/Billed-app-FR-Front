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


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then I try upload a valid file", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion'

      // pathname = ROUTES_PATH['NewBill']
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
    
    test("Then I try to upload", () => {
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
      // console.log(inputFile.files[0].webkitRelativePath)

      expect(mockHandleChangeFile).toHaveBeenCalledTimes(1)
      // console.log(typeof inputFile.files[0]);
      expect(inputFile.files[0]).toBeTruthy() // change to beundefined
    })
    
    test("Then handleSubmit", () => {
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

      // console.log(screen.getByTestId('datepicker'));

      userEvent.type(screen.getByTestId('amount'), '249')
      expect(screen.getByTestId('amount').value).toBe('249')
      // console.log(screen.getByTestId('amount').value);

      userEvent.type(screen.getByTestId('pct'), '17')
      expect(screen.getByTestId('pct').value).toBe('17')
      // console.log(screen.getByTestId('pct').value);

      // userEvent.type(getByTestId('file'), '')
      // expect(getByTestId('file').value).toBe('')


      
      fireEvent.submit(screen.getByTestId('form-new-bill'));
      // expect(mockHandleSubmit).toHaveBeenCalled()
      expect(newBill.updateBill).toHaveBeenCalledTimes(1)
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {

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

  describe("When an error occurs on API", () => {

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
    })

    test("fetches bills from an API and fails with 404 message error", async () => {

      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      mockStore.bills.mockImplementation(() => {
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
      expect(mockStore.bills().create).rejects.toThrow(/Erreur 404/)

      // 
      // mockEvent.target.mockReturnValue("https://localhost:3456/images/test.jpg");
      // jest.spyOn(event, 'preventDefault')


      // const mockHandleChangeFile = jest.fn(newBill.handleChangeFile(mockEvent))
      // const mockUpdateBill = jest.fn(newBill.updateBill)
      // jest.spyOn(mockUpdateBill)

      // const inputFile = screen.getByTestId(`file`)
      // inputFile.addEventListener("change", (event) => mockHandleChangeFile(event))

      // const file = new File(
      //   ["image"], 
      //   "image.png", 
      //   { type: "image/png", }
      // );

      // userEvent.upload(inputFile, file);
      // console.log(typeof inputFile.files[0]);
      // expect(inputFile.files[0]).toBeTruthy() // change to beundefined

      // console.log(mockHandleChangeFile)

      // expect(mockUpdateBill).rejects.toThrow()
      // expect(mockHandleChangeFile).toHaveBeenCalledTimes(1)
      // expect(mockHandleChangeFile(mockEvent)).rejects.toThrow(/Erreur 404/)
    })
  })
})