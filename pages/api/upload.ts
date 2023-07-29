// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Papa from "papaparse";
import { connectToDatabase } from "@/db/connectDb";

type userType = {
  first_name: string;
  last_name: string;
  country_code: string;
  whatsapp_number: string;
  email: string;
  tags: string;
};

const uploadFile = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    // Connect to the database
    const { db } = await connectToDatabase();

    // Get the users collection
    const usersCollection = db.collection("users");
    // Parse the CSV data
    const parsedData = Papa.parse(req.body).data;
    // Get the header row
    const headerRow = parsedData[4];
    console.log(parsedData);

    // Check if the header contains all 6 fields
    if (headerRow.length !== 6) {
      throw new Error("Invalid CSV format");
    }
    // Remove 5 items(meta & header data) from the start and 2 items from the end
    const dataWithoutMeta = parsedData.slice(5, parsedData.length - 2);

    const obj: userType[] = dataWithoutMeta.map((row: any[]) => {
      return {
        first_name: row[0],
        last_name: row[1],
        country_code: row[2],
        whatsapp_number: row[3],
        email: row[4],
        tags: row[5],
      };
    });

    // Save the data to the database
    const saveToDb = await usersCollection.insertMany(obj);
    console.log(saveToDb);
    // throw new Error("Invalid CSV format");
    // Send the response
    res.status(200).json({
      status: "success",
      message: `A total of ${saveToDb.insertedCount} users have been successfully added to the database`,
    });
  } catch (error) {
    // Send the error message
    res.status(500).json({
      status: "failure",
      message: error?.message,
    });
  }
};

/**
 * @param req
 * @param res
 */

// Read all users from the "users" collection
const getAllUsers = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const { db } = await connectToDatabase();
  try {
    // Connect to the database

    const usersCollection = db.collection("users");
    const users = await usersCollection.find({}).toArray();
    res.status(200).json({
      status: "success",
      message: "Users retrieved successfully",
      data: users,
    });
    // Get the users collection
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: "Error retrieving users",
      data: [],
    });
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // switch the methods
  switch (req.method) {
    case "POST": {
      return uploadFile(req, res);
    }
    case "GET": {
      return getAllUsers(req, res);
    }
    default: {
      return null;
    }
  }
}
