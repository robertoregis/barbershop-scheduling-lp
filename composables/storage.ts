export function isExistInStorage (cookie: any, date: any) {
    if(cookie && date) {
        return true
    } else {
        return false
    }
}

export function isValidateInStorage (time: any, hour: number, myCookie: any) {
    let isBooleanCookie = myCookie === 'false'
    if(time.hours > hour && isBooleanCookie) {
        return false
    } else {
        return true
    }
}

export function timeStorage (element: any) {
    let dateNow = new Date()
    let dateStorage = new Date(element)
    let milissegundosElapsed = dateNow.getTime() - dateStorage.getTime()
    let secondsElapsed: any = (milissegundosElapsed / 1000).toFixed(0)
    let minutesElapsed: any = (secondsElapsed / 60).toFixed(2)
    let hoursElapsed = (minutesElapsed / 60).toFixed(2)
    let timeElapsed = {
        miliseconds: milissegundosElapsed,
        seconds: Number(secondsElapsed),
        minutes: Number(minutesElapsed),
        hours: Number(hoursElapsed)
    }
    return timeElapsed
}