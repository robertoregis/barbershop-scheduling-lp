export function textSlice(text: string, limit: number) {
  if(text) {
    if(text.length >= limit) {
      return text.slice(0, (limit -1)) + '...'
    } else {
      return text
    }
  } else {
    return text
  }
}

export function toCapitalize(word: string | any) {
  let wordFirst = word.slice(0, 1)
  let rest = word.slice(1)
  let nameCapitalize = wordFirst.toUpperCase() + rest
  let regexp = /[-,.]/gi
  let result = nameCapitalize.replace(regexp, " ")
  return result
}

export function stringFirstUpper(word: string) {
  // pegando a primeira letra
  let firstLetter = word.slice(0, 1).toUpperCase()
  let stringWithoutTheLastLetter = word.slice(1)
  let modifiedString = firstLetter + stringWithoutTheLastLetter
  return modifiedString
}

export function getOrder(order: any, columns: any) {
  let startArray:any = []
  let endArray:any = []
  // verificar se o tamanho do objeto é igual o tamanho do array
  let countOfColumns = Object.keys(columns).length
  if(order.length === countOfColumns) {
      let newArray = Object.entries(columns)
      for(let count = 0; count < countOfColumns; count++) {
          let objeto = newArray[count][1]
          startArray.push(objeto)
      }
      order.forEach((orderSingular:any) => {
          for(let count = 0; count < startArray.length; count++) {
              let objectOrder = startArray[count]
              if(orderSingular === objectOrder.criteria) {
                  endArray.push(objectOrder)
              }
          }
      })
      return endArray
  }
}

export function getOrderTeam(order: any, dataOrder: any) {
  let startArray:any = []
  let endArray:any = []
  // verificar se o tamanho do objeto é igual o tamanho do array
  let countOfDataOrder = Object.keys(dataOrder).length
  if(order.length === countOfDataOrder) {
      let newArray = Object.entries(dataOrder)
      for(let count = 0; count < countOfDataOrder; count++) {
          let newObject = {
              name: newArray[count][0],
              value: newArray[count][1]
          }
          startArray.push(newObject)
      }
     order.forEach((orderSingular: any) => {
          for(let count = 0; count < startArray.length; count++) {
              let objectOrder = startArray[count]
              if(orderSingular === objectOrder.name) {
                  endArray.push(objectOrder)
              }
          }
      })
      return endArray
  }
}

export function name_formated(title:string) {
  let com_acento = "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ";
  let sem_acento = "AAAAAAACEEEEIIIIDNOOOOOOUUUUYRsBaaaaaaaceeeeiiiionoooooouuuuybyr";
  let novastr = "";
  for(let i=0; i < title.length; i++) {
      let troca=false;
      for (let a=0; a<com_acento.length; a++) {
          if (title.substr(i,1)==com_acento.substr(a,1)) {
              novastr+=sem_acento.substr(a,1);
              troca=true;
              break;
          }
      }
      if (troca==false) {
          novastr+=title.substr(i,1);
      }
  }
  let array = novastr.split(' ')
  let join = array.join('-')
  let name = join.toLowerCase()
  return name
}

export function lengthOfStringTitleSposonshirp(stringFirst: string, stringLast: string) {
  if((stringFirst.length) <= 9 && (stringFirst.length <= 8)) {
    return 1
  } else if((stringFirst.length) > 9 && (stringFirst.length) <= 13 || (stringLast.length) > 8 && (stringLast.length) <= 12) {
    //console.log(2)
    return 2
  } else if((stringFirst.length) > 13 && (stringFirst.length) <= 19 || (stringLast.length) > 12 && (stringLast.length) <= 18) {
      //console.log(3)
      return 3
  } else if((stringFirst.length) > 19 || (stringLast.length) > 18) {
      //console.log(4)
      return 4
  }
}

export const cryptCPF = (cpf: string) => {
  let partFirst = cpf.slice(0, 2)
  let partLast = cpf.slice(-3)
  let cpfCrypt = partFirst + '*.***.***' + partLast
  return cpfCrypt
}

export function formatString(str: string) {
  // Converte todas as letras para minúsculas
  str = str.toLowerCase();
  // Substitui caracteres especiais, barras e espaços em branco por hífens
  str = str.replace(/[^a-z0-9]/g, '-');
  return str;
}
