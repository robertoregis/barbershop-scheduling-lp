export function getWeek(date?: string | any) {
    let currentDate: Date | any
    if(date) {
        currentDate = date
    } else {
        currentDate = new Date()
    }
    let oneJan: Date | any = new Date(currentDate.getFullYear(), 0, 1)
    let numberOfDays = Math.floor((currentDate - oneJan) / (24 * 60 * 60 * 1000))
    let result = Math.ceil((currentDate.getDay() + 1 + numberOfDays) / 7)
    return 'Semana ' + result
}

export function switchMonth(numberOfMonth: number) {
    let arrayOfMonths = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    return arrayOfMonths[numberOfMonth - 1]
}

export function changeTitle(period: string): any {
    let date = new Date()
    let titleDay: string = ''
    let titleWeek: string = ''
    let titleMonth: string = ''

    if(period === 'day') {
        titleDay = `${date.getDate()}/${date.getMonth() + 1}`
    } else if(period === 'week') {
        titleWeek = getWeek()
    } else if(period === 'month') {
        titleMonth = switchMonth(date.getMonth() + 1)
    }

    return {
        titleDay,
        titleWeek,
        titleMonth
    }
}

export function changeTitleInitDate(period: string, initDate: string): any {
    let date = new Date()
    let titleDay: string = ''
    let titleWeek: string = ''
    let titleMonth: string = ''
    let currentDate: string = ''
    let currentMonth: string = ''
    let currentYear: string = ''
    let myDate: Date | any = null

    if(period === 'day') {
        if(initDate) {
            let [day, month, year]:any = initDate.split('/')
            titleDay = `${day}/${month}`
            currentDate = day
            currentMonth = month
            currentYear = year
            myDate = new Date(year, (month - 1), day)
        } else {
            titleDay = `${date.getDate()}/${date.getMonth() + 1}`
        }
    } else if(period === 'week') {
        titleWeek = getWeek()
    } else if(period === 'month') {
        titleMonth = switchMonth(date.getMonth() + 1)
    }

    return {
        titleDay,
        titleWeek,
        titleMonth,
        currentDate,
        currentMonth,
        currentYear,
        date: myDate
    }
}

export function getNewDate(date: Date | any) {
    let currentDay = date.getDate()
    let currentMonth = date.getMonth() + 1
    let currentYear = date.getFullYear()

    let newMonth
    if(currentMonth < 10) {
        newMonth = `0${currentMonth}`
    } else {
        newMonth = currentMonth
    }
    let newYear = String(currentYear)
    let newDay
    if(currentDay < 10) {
        newDay = `0${currentDay}`
    } else {
        newDay = String(currentDay)
    }

    return {
        currentDay,
        currentMonth,
        currentYear,
        day: newDay,
        month: newMonth,
        year: newYear
    }
}

/*export function changeDay(method: any, date: Date, currentDay: string, currentMonth: string) {
    if(method === 1) {
        date.setDate(date.getDate() + 1)
    } else if(method === 0) {
        date.setDate(date.getDate() - 1)
    }
    let newDate = getNewDate(date)
    let titleDay = `${currentDay}/${currentMonth}`

    return {
        titleDay,
        year: newDate.
    }
}*/

export function changeCurrentDateAndTitleDateAndNewDate(date: Date, type: string) {
    let currentDay = date.getDate()
    let currentMonth = (date.getMonth() + 1)
    let currentYear = date.getFullYear()
    let titleDay
    let titleMonth
    let titleWeek
    if(type === 'day') {
        titleDay = currentDay + '/' + currentMonth
        titleWeek = 'Semana'
        titleMonth = 'Mês'
    } else if(type === 'week') {
        titleWeek = getWeek(new Date(currentYear, currentMonth - 1, currentDay))
        titleMonth = 'Mês'
        titleDay = 'Dia'
    } else if(type === 'month') {
        titleMonth = switchMonth(currentMonth)
        titleDay = 'Dia'
        titleWeek = 'Semana'
    }
    let newMonth
    if(currentMonth < 10) {
        newMonth = '0' + currentMonth
    } else {
        newMonth = String(currentMonth)
    }
    let newDay
    if(currentDay < 10) {
        newDay = '0' + currentDay
    } else {
        newDay = String(currentDay)
    }
    let newYear = String(currentYear)

    return {
        currentDay,
        currentMonth,
        currentYear,
        titleDay,
        titleWeek,
        titleMonth,
        newDay,
        newMonth,
        newYear
    }
}

export function getSearch(search: object | any) {
    let gender, sport_id, association_id
    if(search.naipe) {
        gender = search.naipe
    } else {
        gender = ''
    }
    if(search.modality) {
        sport_id = search.modality
    } else {
        sport_id = ''
    }
    if(search.association) {
        association_id = search.association
    } else {
        association_id = ''
    }

    return {
        gender,
        sport_id,
        association_id
    }
}