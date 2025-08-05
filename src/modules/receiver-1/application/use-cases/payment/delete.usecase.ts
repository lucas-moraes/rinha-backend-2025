import { db } from "../../../../../database/connection";

export const deleteMany = async () => {
  try {
    await db.query(`DELETE FROM payments`);
  } catch (error) {
    console.error(error);
  }
};
