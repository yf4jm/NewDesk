import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import openApp from "../utils/openApp";
import AddAppModal from "../components/modals/addAppModal";
import getApps from "../utils/getApps";
import DesktopCanvas from "../components/canvas/DesktopCanvas";
import TitleBar from "../components/titleBar/titleBar";
const Desktop = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [apps, setApps] = useState({ apps: [] });
  
  useEffect(() => {
    getApps().then((appsManifest) => {
      setApps(appsManifest || { apps: [] });
    });
  }, []);

  const openAddAppModal = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("add_app_modal", "open");
    navigate({ search: newSearchParams.toString() }, { replace: true });
  };

  return (
    <>

    <main className="flex flex-col min-h-screen bg-base-100 text-base-content pt-[30px] overflow-none">
       
    <div>
    <TitleBar />
    </div>
      {/* <div className="flex justify-center mt-3">
        <p className="text-3xl">Desktop</p>
        <Link to={"apps/chatbot"}>ai</Link>
      </div>
      <div className="justify-end flex gap-4">
        <button className="btn" onClick={openAddAppModal}>add app</button>
        <Link to={"/settings"}>settings</Link>
      </div> */}

      <AddAppModal />
      <DesktopCanvas />
      {/* <div className="flex flex-col w-full gap-4">
        <p>Installed Apps</p>
        <div className="grid gap-4 grid-cols-6">
          {Array.isArray(apps.apps) && apps.apps.length > 0 && (
            apps.apps.map((app) => (
              <div
                key={app.name}
                onClick={() => openApp(
                  app.name, 
                  `/apps/${app.name}`, 
                  app.options?.window || {}
                )}
                className="cursor-pointer bg-base-200 w-fit h-fit p-5 rounded-2xl"
              >
                {app.name}
              </div>
            ))
          )}
        </div> */}
      {/* </div> */}
    </main>
    </>
  );
};

export default Desktop;
