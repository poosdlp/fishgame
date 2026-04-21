import { useState } from "react";

type TutorialSection = {
  title: string;
  body: string;
};

const sections: TutorialSection[] = [
  {
    title: "Welcome to Phising",
    body: "Welcome! This tutorial will teach you everything you need to know about the game",
  },
  {
    title: "Downloading",
    body: "Phising requires you to download a mobile app on your android device. Get Hooked! requires both the website and mobile app to be active as your phone is the fishing rod",
  },
  {
    title: "Registering",
    body: "Once you have installed Get Hooked! on your android device, you will have the ability to register a Phising account. An email will be sent to verify your account",
  },
  {
    title: "Syncing",
    body: "Now that you have been verified, you can find a qr code on the website to scan with the qr code reader on the mobile app. You are now in sync and can start playing.",
  },
  
  {
    title: "Casting",
    body: "Move your device like you would a fishing rod to cast your line.",
  },
  {
    title: "Fish Behavior",
    body: "Fish swim in from the edges of the lake. When they get close to your bobber they become attracted and start circling it.",
  },
  {
    title: "The Bite",
    body: "Once enough fish are hovering, one will be chosen to attempt a bite. There's a 50/50 chance it commits or backs off and you have to wait again.",
  },
  {
    title: "Catching",
    body: "When the bobber starts dunking and your phone vibrates, hook the fish by yanking your phone upwards!",
  },
  {
    title: "Inventory & Leaderboard",
    body: "Your caught fish are saved to your inventory on the left. Check the global leaderboard on the right to see how you stack up.",
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
