
export function convertNumberToString(unity: number) {
    if(typeof unity === "number") {
        return unity.toString()
    } else if(typeof unity === "string") {
        return unity
    } else {
        return {
            error: 'Este dado não é um número e nem uma string'
        }
    }
}

export function convertOfArrayForObject(object: object, indice: string | number) {
    let startArray = []
    let endObject
    startArray = Object.entries(object)
    if(indice === 1) {
        endObject = startArray[0][1]
    } else if(indice === 2) {
        endObject = startArray[1][1]
    } else if(indice === 3) {
        endObject = startArray[2][1]
    }
    return endObject
}

export function convertOfArrayForObjectMedalsOurTrophies(object: object) {
    let startArray = []
    let endObject = {
        our: null,
        silver: null,
        bronze: null
    }
    startArray = Object.entries(object)
    startArray.forEach(element => {
        switch (element[0]) {
            case '1':
                endObject.our = element[1]
                break;
            case '2':
                endObject.silver = element[1]
                break;
            case '3':
                endObject.bronze = element[1]
                break;
            default:
                break;
        }
    })
    return endObject
}

export function returnArrayOfObject(object: object) {
    let array = Object.entries(object)
    return array
}

export function convertOfObjectForArrayRanking(object: object) {
    let startArray = []
    let endObject:any = []
    startArray = Object.entries(object)
    startArray.forEach((element) => {
        let name = element[0]
        let jsonObject:any = JSON.stringify(element[1])
        let newObject:any = JSON.parse(jsonObject)
        let object = {
            name,
            subtotal: newObject.subtotal,
            total_count: newObject.total_count
        }
        endObject.push(object)
    })
    return endObject
}