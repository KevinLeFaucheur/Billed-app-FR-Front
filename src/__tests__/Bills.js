/**
 * @jest-environment jsdom
 */

import { getAllByTestId, getByTestId, screen, waitFor} from "@testing-library/dom"
import "@testing-library/jest-dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";

import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

// jest.mock("../app/store", () => mockStore)

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

      expect(mockHandleClickNewBill).toHaveBeenCalled()
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

      expect(mockHandleClickIconEye).toHaveBeenCalled();
      // expect(screen.getByRole('dialog', {hidden: true})).toHaveClass('show')
    })
  })

  //
  describe("When I am on Bills Page and ", () => {
    // Branch only
    test("Then else path", async () => {

    //   const onNavigate = () => document.body.innerHTML = ROUTES_PATH[Bills];

    //   const store = null;

    //   const bills = new Bills({ document, onNavigate, store, localStorageMock })

    //   const getBills = jest.fn(bills.getBills)

    //   const result = await getBills()

    //   expect(result).toBe(undefined)
    })

    test("Then Bills.bills().list() should match an object with a length of 4", async () => {

      const bills = new Bills({ document, onNavigate, store: mockStore, localStorage: localStorageMock })

      // console.log(await bills.getBills());
      // console.log(await bills.localStorage);
      const result = await bills.getBills()

      expect(result.length).toBe(4)
    //   expect(result[0].date).toBe('4 Avr. 04')
    //   expect(result[0].status).toBe("En attente")
    //   expect(result[1].date).toBe("1 Jan. 01")
    })
  })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {

    test("fetches bills from mock API GET", async () => {
      // localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      // const root = document.createElement("div")
      // root.setAttribute("id", "root")
      // document.body.append(root)
      // router()
      // window.onNavigate(ROUTES_PATH.Bills)

      // await waitFor(() => screen.getByText("Mes notes de frais"))

      // expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
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

      mockStore.bills.mockImplementation(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)

      const rootDiv = document.getElementById('root')
      const bills = new Bills({ document, onNavigate, store: mockStore, localStorage: localStorageMock })


      // const error = await mockStore.bills().list().then(e => e).catch(e => e)
      // console.log(error.message)
      // const result = await bills.getBills().then(e => e).catch(e => e)
      // console.log(result);

      expect(bills.getBills()).rejects.toThrow("Erreur 404")

      // expect(error.message).toBe('Erreur 404');

      // const html = BillsUI({ error: "Erreur 404" });
      // document.body.innerHTML = html;

      // await new Promise(process.nextTick);
      // const message = /*await*/ screen.getByText(/Erreur 404/)
      // expect(message).toBeTruthy()
    })

    // had an effect
    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })

      window.onNavigate(ROUTES_PATH.Bills)

      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;

      await new Promise(process.nextTick);
      const message = /*await*/ screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })

    // 
    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.resolve(new Error("Erreur 500"))
          }
        }
      })

      window.onNavigate(ROUTES_PATH.Bills)

      // const html = BillsUI({ error: "Erreur 500" });
      // document.body.innerHTML = html;

      await new Promise(process.nextTick);
      const message = /*await*/ screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
})

