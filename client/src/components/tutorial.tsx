import { useState } from "react";

function getImage(key: string): string {
  return `/tutorial/${key}.png`;
}

type TutorialSection = {
  title: string;
  body: string;
  imageKey: string;
};

const sections: TutorialSection[] = [
  {
    title: "Welcome to Phising",
    body: "Welcome! This tutorial will teach you everything you need to know about the game",
    imageKey: "welcome",
  },
  {
    title: "Downloading",
    body: "Phising requires you to download a mobile app on your android device. Phishing requires both the website and mobile app to be active as your phone is the fishing rod",
    imageKey: "downloading",
  },
  {
    title: "Registering",
    body: "Once you have installed Phishing on your android device, you will have the ability to register a Phising account. An email will be sent to verify your account",
    imageKey: "registering",
  },
  {
    title: "Syncing",
    body: "Now that you have been verified, you can find a qr code on the website to scan with the qr code reader on the mobile app. You are now in sync and can start playing.",
    imageKey: "syncing",
  },
  
  {
    title: "Casting",
    body: "Important: Keep a finger on the device while fishing or reelling otherwise your gesture will not be detected. To fish ",
    imageKey: "casting",
  },
  {
    title: "Fish Behavior",
    body: "Fish swim in from the edges of the lake. When they get close to your bobber they become attracted and start circling it.",
    imageKey: "behavior",
  },
  {
    title: "The Bite",
    body: "Once enough fish are hovering, one will be chosen to attempt a bite. There's a 50/50 chance it commits — or backs off and you have to wait again.",
    imageKey: "bite",
  },
  {
    title: "Catching",
    body: "When the bobber starts dunking and 'Catch Fish!' appears, click it fast to reel in your catch!",
    imageKey: "catching",
  },
  {
    title: "Inventory & Leaderboard",
    body: "Your caught fish are saved to your inventory on the left. Check the global leaderboard on the right to see how you stack up.",
    imageKey: "inventory",
  },
];

type Props = {
  onClose: () => void;
};

export function Tutorial({ onClose }: Props) {
  const [page, setPage] = useState(0);
  const section = sections[page];
  const isFirst = page === 0;
  const isLast = page === sections.length - 1;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-header">
        <span className="tutorial-page-count">{page + 1} / {sections.length}</span>
        <button className="tutorial-close" onClick={onClose}>✕</button>
      </div>

      <div className="tutorial-body">
        {getImage(section.imageKey) && (
          <img
            className="tutorial-sprite"
            src={getImage(section.imageKey)}
            alt={section.title}
            style={{ imageRendering: "pixelated" }}
          />
        )}
        <h2 className="tutorial-title">{section.title}</h2>
        <p className="tutorial-text">{section.body}</p>
      </div>

      <div className="tutorial-nav">
        <button
          className="tutorial-btn"
          onClick={() => setPage(p => p - 1)}
          disabled={isFirst}
        >
          ← Back
        </button>
        {isLast ? (
          <button className="tutorial-btn tutorial-btn-done" onClick={onClose}>
            Done
          </button>
        ) : (
          <button className="tutorial-btn" onClick={() => setPage(p => p + 1)}>
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
