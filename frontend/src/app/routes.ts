import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { UploadForm } from "./pages/UploadForm";
import { UploadDocuments } from "./pages/UploadDocuments";
import { Processing } from "./pages/Processing";
import { FormFill } from "./pages/FormFill";
import { Preview } from "./pages/Preview";
import { Success } from "./pages/Success";
import { HowItWorks } from "./pages/HowItWorks";
import { Help } from "./pages/Help";
import { FormHistory } from "./pages/FormHistory";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/upload-form",
    Component: UploadForm,
  },
  {
    path: "/upload-documents",
    Component: UploadDocuments,
  },
  {
    path: "/processing",
    Component: Processing,
  },
  {
    path: "/form",
    Component: FormFill,
  },
  {
    path: "/preview",
    Component: Preview,
  },
  {
    path: "/success",
    Component: Success,
  },
  {
    path: "/history",
    Component: FormHistory,
  },
  {
    path: "/how-it-works",
    Component: HowItWorks,
  },
  {
    path: "/help",
    Component: Help,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);