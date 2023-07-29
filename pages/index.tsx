import { Inter } from "next/font/google";
import FileUpload from "@/components/FileUpload/FileUpload";
import { useState } from "react";

import Dialog from "@/components/Dialog/Dialog";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [responseMessage, setResponseMessage] = useState({
    status: "",
    message: "",
  });
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-20 ${inter.className}`}
    >
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 ">
          CSV TO DB&nbsp;
        </p>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px]  before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:lg:h-[360px]">
        {/* File upload component */}
        <FileUpload setResponseMessage={setResponseMessage} />
      </div>

      {/* Dialog */}
      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        {responseMessage.status !== "" && (
          <Dialog
            status={responseMessage.status}
            message={responseMessage.message}
            onClose={() =>
              setResponseMessage({
                status: "",
                message: "",
              })
            }
          />
        )}
      </div>
    </main>
  );
}
