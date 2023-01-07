/**
 * @jest-environment jsdom
 */

import { findByRole, getAllByTestId, getByTestId, getByText, screen, waitFor } from "@testing-library/dom"
import "@testing-library/jest-dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js"

import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"

import router from "../app/Router.js"
import userEvent from "@testing-library/user-event"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon')

    })

    // Scénario 7
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

  // Scénario 4
  describe("When I am on Bills Page and I click on 'Nouvelle note de frais' button", () => {
    test("Then it should open the NewBill page", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      const mockHandleClickNewBill = jest.fn(() => Bills.handleClickNewBill)

      const buttonNewBill = await waitFor(() => screen.getByTestId(`btn-new-bill`))
      if (buttonNewBill) buttonNewBill.addEventListener('click', mockHandleClickNewBill)

      userEvent.click(buttonNewBill);

      expect(mockHandleClickNewBill).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('form-new-bill')).toBeDefined()
    })
  })

  // Scénario 13
  describe("When I am on Bills Page and I click on an eye icon", () => {
    test("Then it should show 'Justificatif' modal", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      
      $.fn.modal = jest.fn()

      const iconEye = screen.getAllByTestId(`icon-eye`)[0]
      expect(iconEye).toBeDefined()

      const mockHandleClickIconEye = jest.fn(Bills.handleClickIconEye)
      if(iconEye) iconEye.addEventListener('click', (iconEye) => mockHandleClickIconEye(iconEye))

      userEvent.click(iconEye);

      const modal = document.body.querySelector('.modal-body')

      expect(mockHandleClickIconEye).toHaveBeenCalledTimes(1);
      expect(modal.innerHTML).toBeTruthy()
    })
  })

  // Scénario 14: Fermerture modale
  describe("When I click on the modal close 'x' button", () => {
    test("Then the modal should be removed", async () => {
      // document.body.innerHTML = BillsUI({ data: bills })

      // window.onNavigate(ROUTES_PATH.Bills)

      // Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // window.localStorage.setItem('user', JSON.stringify({
      //   type: 'Employee'
      // }))

      // const modal = document.getElementById('modaleFile')
      // expect(modal).toBeTruthy()

      // modal.classList.add('show')

      // const modalButton = document.body.querySelector('.close')
      // expect(modalButton).toBeTruthy()

      // userEvent.click(modalButton)

      // // await waitFor(() => expect(modal).toHaveStyle('display: none'), {timeout: 4000})
      
      // // Timer required -
      // // Or add class takes too long to be detected by expect statement below
      // let i = 0;
      // while(document.querySelector("#modaleFile").classList.contains("show") /*&& i < 10*/) {
        
      //   console.log(document.querySelector("#modaleFile").classList.contains("show")) 
      //   await new Promise((r) => setTimeout(r, 100));
      //   i++;
      // }
      
      // expect(document.querySelector("#modaleFile")).toHaveClass("show");
      // expect(modal).toHaveClass("show");

      // // expect(modal).not.toHaveClass('show')
      // expect(modal).toHaveStyle('display: none')

    })
  })

  //
  describe("When I am on Bills Page and Bills.store is null", () => {
    // test("Then the getBills function should returned undefined", async () => {

    //   const onNavigate = () => document.body.innerHTML = ROUTES_PATH[Bills];

    //   const store = null;

    //   const bills = new Bills({ document, onNavigate, store, localStorage: localStorageMock })
    //   const result = await bills.getBills()

    //   expect(result).toBe(undefined)
    // })

    test("Then the getBills function should return an array of bills", async () => {

      const bills = new Bills({ document, onNavigate, store: mockStore, localStorage: localStorageMock })
      const result = await bills.getBills()

      expect(result.length).toBe(4)
      expect(result[0].date).toBe('4 Avr. 04')
      expect(result[0].status).toBe("En attente")
      expect(result[1].date).toBe("1 Jan. 01")
    })
  })
  })

  // Scénario 5
  describe("When I am on Bills Page and there is no bill", () => {
    test("Then the bills table should be empty", async () => {
      
      jest.spyOn(mockStore, "bills")
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.resolve([])
          }
        }
      })

      const onNavigate = () => document.body.innerHTML = ROUTES_PATH[Bills]
      const bills = new Bills({ document, onNavigate, store: mockStore, localStorage  })
      const data = await bills.getBills()
      document.body.innerHTML = BillsUI({ data })

      const tbody = screen.getByTestId('tbody').innerHTML.replace(/\s|\n/g, '')
      console.log(tbody)
      expect(tbody).toBe('')
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee and I navigate to Bills", () => {

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

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe("When it fetches bills from mock API GET without error", () => {
    test("Then 'Nouvelle note de frais' button should be on the screen", async () => {

      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId("btn-new-bill"))
      expect(screen.getByTestId("btn-new-bill").textContent).toBe('Nouvelle note de frais')
      
    })

  // Scénario 6
  describe("When an error occurs on API GET (Store.bills().list)", () => {
    test("Then it fails with 404 message error", async () => {
      
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
        
      window.onNavigate(ROUTES_PATH.Bills)
      
      await new Promise(process.nextTick);
      console.log(screen.getByTestId('error-message').textContent);
      expect(screen.getByTestId('error-message').textContent).toMatch(/Erreur 404/)
    })

    test("Then it fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })

      window.onNavigate(ROUTES_PATH.Bills)

      await new Promise(process.nextTick);
      console.log(screen.getByTestId('error-message').textContent);
      expect(screen.getByTestId('error-message').textContent).toMatch(/Erreur 500/)
    })
  })

  })
})

