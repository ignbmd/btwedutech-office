const date = new Date()
const nextDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)

// prettier-ignore
const nextMonth = date.getMonth() === 11 ? new Date(date.getFullYear() + 1, 0, 1) : new Date(date.getFullYear(), date.getMonth() + 1, 1)
// prettier-ignore
const prevMonth = date.getMonth() === 11 ? new Date(date.getFullYear() - 1, 0, 1) : new Date(date.getFullYear(), date.getMonth() - 1, 1)

export const data = {
  events: [
    {
      id: 1,
      title: 'Pelajaran Nasionalisme',
      start: date,
      end: nextDay,
      allDay: false,
      extendedProps: {
        calendar: 'Pak Jaya'
      }
    },
    {
      id: 2,
      title: 'Menjadi Warga Negara yang Baik',
      start: new Date(date.getFullYear(), date.getMonth() + 1, -11),
      end: new Date(date.getFullYear(), date.getMonth() + 1, -9),
      allDay: false,
      extendedProps: {
        calendar: 'Pak Jaya'
      }
    },
    {
      id: 3,
      title: 'Trigonometri',
      allDay: false,
      start: new Date(date.getFullYear(), date.getMonth() + 1, -9),
      end: new Date(date.getFullYear(), date.getMonth() + 1, -7),
      extendedProps: {
        calendar: 'Bu Juli'
      }
    },
    {
      id: 4,
      title: "3 Kunci Sukses TIU",
      start: new Date(date.getFullYear(), date.getMonth() + 1, -11),
      end: new Date(date.getFullYear(), date.getMonth() + 1, -9),
      allDay: false,
      extendedProps: {
        calendar: 'Dr.Hadi'
      }
    },
    {
      id: 5,
      title: 'Tips Belajar SKD',
      start: new Date(date.getFullYear(), date.getMonth() + 1, -13),
      end: new Date(date.getFullYear(), date.getMonth() + 1, -11),
      allDay: false,
      extendedProps: {
        calendar: 'Dr.Hadi'
      }
    }
  ]
}
