
export function isExists(data: any) {
    if(typeof data === "number") {
        return true
    } else if(data === "") {
        return false
    }else {
        if(typeof data !== undefined || typeof data !== null) {
            return true
        } else {
            false
        }
    }
}