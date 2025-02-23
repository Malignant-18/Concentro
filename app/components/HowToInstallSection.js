export default function HowToInstallSection() {
    return (
      <div className="bg-yellow-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-yellow-800 sm:text-4xl" data-aos="fade-up">
              How to Install
            </h2>
            <div className="mt-10 space-y-8 text-gray-600">
              {installSteps.map((step, index) => (
                <InstallStep key={index} step={step} index={index + 1} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const installSteps = [
    "Clone my repo:\t git clone https://github.com/aaron/concentro.git",
    "Navigate to the project directory:\t cd concentro",
    "Install requirements:\t pip install -r requirements.txt",
    "Run the backend server:\t python backend.py",
    "Open Chrome and go to chrome://extensions/",
    "Enable Developer mode and click 'Load unpacked'.",
    "Select the 'public' folder inside the 'concentro' folder and start using it!",
  ];
  
  function InstallStep({ step, index }) {
    return (
      <div className="flex gap-x-3" data-aos="fade-right">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500 text-white">
          {index}
        </div>
        <div>
          <p className="mt-2">{step}</p>
        </div>
      </div>
    );
  }