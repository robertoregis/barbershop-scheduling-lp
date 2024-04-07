import { addDoc, collection, Timestamp, doc, updateDoc, increment } from "firebase/firestore";
import { useFirebase } from "./useFirebase";
import { useDateCurrent } from './date';

  interface AddWarningOptions {
    type: string;
    text: string;
    user_id?: string;
    barber_id?: string;
    is_master: boolean;
    is_released?: boolean;
  }

  interface AddInteractionOptions {
    text: string;
    user_id?: string;
    barber_id?: string;
    is_master: boolean;
    is_released?: boolean;
  }

export const useCreate = () => {
  const { firestore } = useFirebase();
  const { year, month, day, hours, minutes } = useDateCurrent();
  let dateTimestamp = Timestamp.fromDate(new Date());

  async function addWarning(options: AddWarningOptions) {
    await addDoc(collection(firestore, "Warnings"), {
      created_at: dateTimestamp,
      updated_at: dateTimestamp,
      date: `${day}/${month}/${year}`,
      hours: `${hours}:${minutes}`,
      type: options.type,
      text: options.text,
      user_id: options.user_id ? options.user_id : null,
      barber_id: options.barber_id ? options.barber_id : null,
      is_master: options.is_master,
      is_released: true
    });
  }

  const addInteraction = async (options: AddInteractionOptions) => {
    await addDoc(collection(firestore, "Interactions"), {
      text: options.text,
      user_id: options.user_id ? options.user_id : null,
      barber_id: options.barber_id ? options.barber_id : null,
      created_at: dateTimestamp,
      is_master: options.is_master,
      is_released: true,
    })
  }

  const updateInfo = async (options: any) => {
    const docRef = doc(firestore, "Info", "config");
    await updateDoc(docRef, {
        barbers_count: increment(options.barbers ? options.barbers : 0),
        hairstyles_count: increment(options.hairstyles ? options.hairstyles : 0),
        users_count: increment(options.users ? options.users : 0),
        schedules_count: increment(options.schedules ? options.schedules : 0),
        interactions_count: increment(options.interactions ? options.interactions : 0),
        warnings_count: increment(options.warnings ? options.warnings : 0),
        days_count: increment(options.days ? options.days : 0),
    })
  }
  

  return {
    addWarning,
    addInteraction,
    updateInfo
  };
};