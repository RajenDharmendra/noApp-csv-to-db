import React, { useState, useRef } from "react";
import axios, { AxiosResponse } from "axios";

// Define the props type for the component
interface FileUploadProps {
  setResponseMessage: React.Dispatch<
    React.SetStateAction<{
      status: string;
      message: string;
    }>
  >;
}

const FileUpload = ({ setResponseMessage }: FileUploadProps) => {
  // Define the state variables for the component
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Create a ref for the file input element
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Event handler for the file input element
  const onFileChange = (event: any) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      // ---------------Data validation start----------------------------- //
      // Check if the uploaded file is a CSV file
      const allowedExtensions = ["csv"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      if (!allowedExtensions.includes(fileExtension)) {
        setSelectedFile(null);
        fileInputRef.current!.value = "";
        setResponseMessage({
          status: "error",
          message: "Please upload a valid CSV file.",
        });

        return;
      }

      // Check file size (less than 2 MB)
      const maximumFileSizeInMB = 2;
      const maximumFileSizeInBytes = maximumFileSizeInMB * 1024 * 1024;
      if (file.size > maximumFileSizeInBytes) {
        setSelectedFile(null);
        fileInputRef.current!.value = "";
        setResponseMessage({
          status: "error",
          message: `Please upload a file smaller than ${maximumFileSizeInMB} MB.`,
        });

        return;
      }

      // Read the file content and check the number of columns and their order
      const fileReader = new FileReader();
      fileReader.onload = () => {
        // Split the content of the file by new line
        const content = fileReader.result as string;

        // Split the content of each line in an array
        const lines = content.split("\n");

        // Row which contains the header
        const headerRow = lines[0].trim().toLowerCase();
        const expectedHeader =
          "First_Name,Last_Name,Country_Code,Whatsapp_Number,Email,Tags".toLowerCase();

        // Check if the header row matches the expected header
        if (headerRow !== expectedHeader) {
          setSelectedFile(null);
          fileInputRef.current!.value = "";
          setResponseMessage({
            status: "error",
            message:
              "The CSV file should have the columns in the following order:\nFirst_Name, Last_Name, Country_Code, Whatsapp_Number, Email, Tags",
          });

          return;
        }

        // -----------------Data validation complete-------------------------- //
        setSelectedFile(file);
      };

      fileReader.readAsText(file);
    }
  };

  const onFileUpload = async () => {
    // Check if a file is selected
    if (!selectedFile) {
      setResponseMessage({
        status: "error",
        message: "Please select a file to upload.",
      });

      return;
    }

    setLoading(true);

    // Initialize FormData object to store the data
    const formData = new FormData();

    // Append the file to the FormData object
    formData.append("csvFile", selectedFile);

    try {
      // Send the data to the server, use multipart/form-data as the content type
      const uploadFile = await axios.post<
        unknown,
        AxiosResponse<{
          status: string;
          message: string;
          data?: any;
        }>
      >("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Track upload progress with onUploadProgress event
        onUploadProgress: (progressEvent) => {
          // Calculate the upload progress
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          // Update the progress bar
          setUploadProgress(progress);
          // Reset the progress bar after 5 seconds

          setTimeout(() => {
            setUploadProgress(0);
            fileInputRef.current!.value = "";
          }, 2000);
        },
      });

      // Display the response message
      setResponseMessage({
        status: uploadFile?.data?.status,
        message: uploadFile?.data?.message,
      });
    } catch (error) {
      setSelectedFile(null);
      fileInputRef.current!.value = "";
      setResponseMessage({
        status: error?.response?.data?.status,
        message: error?.response?.data?.message,
      });
      //   alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="z-100">
      <h1 className="text-center text-2xl mb-4 font-thin">Upload a CSV</h1>

      <div className="">
        {loading && (
          <div className="flex flex-col">
            <div className="flex justify-center items-center">
              <div className="border-4 border-solid border-opacity-70 border-blue-500 rounded-full w-12 h-12 animate-pulse opacity-100 duration-300"></div>
            </div>
            <div className="text-sm flex text-gray-500 mt-1 justify-center items-center">
              Processing...
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500 mt-1">Progress</div>
        <div className="mt-1 relative h-2 rounded-full bg-gray-300 mb-4">
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-green-500 duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>

        <input
          ref={fileInputRef}
          className="rounded-lg bg-white opacity-50  sm:rounded-r-none test-sm  duration-300 file:px-2 file:py-1 file:rounded-lg file:bg-gray-800 file:text-white file:opacity-100 file:rounded-r-none file:hover:bg-gray-600 file:duration-300 file:cursor-pointer"
          type="file"
          accept=".csv"
          onChange={onFileChange}
        />
        <button
          onClick={onFileUpload}
          className="rounded-lg bg-gray-800 px-4 py-1.5 text-white hover:bg-gray-600 duration-300 sm:rounded-l-none mt-2 sm:mt-0"
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
