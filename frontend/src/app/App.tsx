import { RouterProvider } from "react-router";
import { router } from "./routes";
import { LanguageProvider } from "./context/LanguageContext";
import { FormDataProvider } from "./context/FormDataContext";

export default function App() {
  return (
    <LanguageProvider>
      <FormDataProvider>
        <RouterProvider router={router} />
      </FormDataProvider>
    </LanguageProvider>
  );
}