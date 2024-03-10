export function getPagesForPagination(lastPage: number, currentPage: number) {
    let pages: number[] = []
    for(let count = 1; count < (lastPage + 1); count++) {
        if(currentPage === 1) {
            if(count < 6 && count !== (lastPage + 1)) {
                pages.push(count)
            }
        } else if(currentPage === 2) {
            if(count < 6 && count !== (lastPage + 1)) {
                pages.push(count)
            }
        } else if(currentPage === lastPage) {
            if(count >= lastPage - 3) {
                pages.push(count)
            }
        } else {
            if(count >= (currentPage - 1) && count <= (currentPage + 1)) {
                pages.push(count)
            }
        }
    }
    return pages
}