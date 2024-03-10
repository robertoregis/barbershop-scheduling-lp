/*import { collection, getDocs, query, where, getFirestore, addDoc, doc, Timestamp } from 'firebase/firestore';
const db = getFirestore()
export async function userAuthentication(userEmail: string): Promise<any> {
    console.log('kkskskaavag')
    let authentication
    const q = query(collection(db, 'Authentication'), where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);
    console.log(q)
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        if(doc.exists()) {
            authentication = {
                id: doc.id,
                data: doc.data()
            }
            return authentication
        }
    });
    if(!authentication) {
        let result = createUserAuthentication(userEmail)
        return result
    }
}

async function createUserAuthentication(userEmail: string): Promise<any> {
    console.log('urururur')
    let user: any = await getUser(userEmail)
    console.log(user)
    let numberRandomly = randomlyGenerate(30)
    let dateTimestamp = Timestamp.fromDate(new Date())
    const authentication = await addDoc(collection(db, "Authentication"), {
        user_id: user.id,
        token: numberRandomly,
        date: dateTimestamp,
        password: '',
        email: userEmail
    });
    return authentication
}

function randomlyGenerate(length: number) {
    let stringRandomly = '';
    let caracteres = 'abcdefg0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg0123456789hijklmnopqrstuvwxyz0123456789hijklmnopqrstuvwxyz';
    for (let i = 0; i < length; i++) {
        stringRandomly += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return stringRandomly;
}

async function getUser(userEmail: string): Promise<any> {
    let user
    const q = query(collection(db, 'Users'), where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        user = {
            id: doc.id,
            data: doc.data()
        }
    });
    return user
}*/