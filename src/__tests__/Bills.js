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
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

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

  //
  describe("When I am on Bills Page and Bills.store is null", () => {
    // Bills.getBills() branch when store is null
    test("Then the getBills function should returned undefined", async () => {

      const onNavigate = () => document.body.innerHTML = ROUTES_PATH[Bills];

      const store = null;

      const bills = new Bills({ document, onNavigate, store, localStorage: localStorageMock })
      const result = await bills.getBills()

      expect(result).toBe(undefined)
    })

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

