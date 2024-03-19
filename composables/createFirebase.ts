import { addDoc, collection, Timestamp } from "firebase/firestore";
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
  

  return {
    addWarning,
    addInteraction
  };
};