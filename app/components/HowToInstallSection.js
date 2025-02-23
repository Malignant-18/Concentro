"use client"
import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const CommandBox = ({ command }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex items-center bg-gray-800 rounded-lg p-4">
      <code className="text-gray-200 font-mono flex-grow">{command}</code>
      <button
        onClick={handleCopy}
        className="ml-4 p-2 rounded-md hover:bg-gray-700 transition-colors"
        aria-label="Copy to clipboard"
      >
        {copied ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <Copy className="w-5 h-5 text-gray-400" />
        )}
      </button>
    </div>
  );
};

const InstallStep = ({ content, index, needsCopy = false }) => {
  return (
    <div className="flex gap-x-3" data-aos="fade-right">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500 text-white">
        {index}
      </div>
      <div className="flex-grow">
        {needsCopy ? (
          <CommandBox command={content} />
        ) : (
          <p className="mt-2 text-gray-600">{content}</p>
        )}
      </div>
    </div>
  );
};

export default function HowToInstallSection() {
  const installSteps = [
    {
      content: "git clone https://github.com/Malignant-18/Concentro/",
      needsCopy: true
    },
    {
      content: "cd concentro",
      needsCopy: true
    },
    {
      content: "pip install -r requirements.txt",
      needsCopy: true
    },
    {
      content: "python backend.py",
      needsCopy: true
    },
    {
      content: "npm run build",
      needsCopy: true
    },
    {
      content: "Open Chrome and go to chrome://extensions/",
      needsCopy: false
    },
    {
      content: "Enable Developer mode and click 'Load unpacked'.",
      needsCopy: false
    },
    {
      content: "Select the 'public' folder inside the 'concentro' folder and start using it!",
      needsCopy: false
    }
  ];

  return (
    <div className="bg-yellow-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-yellow-800 sm:text-4xl" data-aos="fade-up">
            How to Install
          </h2>
          <div className="mt-10 space-y-8">
            {installSteps.map((step, index) => (
              <InstallStep 
                key={index} 
                content={step.content} 
                index={index + 1}
                needsCopy={step.needsCopy}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}