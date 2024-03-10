
export function getTarget(isLinkExternal: string) {
  if(isLinkExternal) {
    return 'blank'
  } else {
    return ''
  }
}

export function linkIsExternal(link: string) {
  let pattern = /^((http|https|ftp):\/\/)/;
  let result = pattern.test(link)
  if(result) {
    return 'a'
  } else {
    return 'NuxtLink'
  }
}

export function totalCaracteres(array: any[]) {
  let newArray: string[] = []
  let totalCaracteres = 0

  array.forEach((element: string | number) => {
      if(typeof element === 'number') {
          newArray.push(element.toString())
      } else if(typeof element === 'string') {
          newArray.push(element)
      }
  })
  newArray.forEach((element: string) => {
      let result = element.length
      totalCaracteres = totalCaracteres + result
  })

  return totalCaracteres
}