import { ScrollableContainer } from "./components/ScrollableContainer";
import { useState } from "react";

function App() {
  const [items, setItems] = useState(5);
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 relative">
      <button
        className="absolute top-2 right-2 z-10 bg-gray-800 dark:bg-gray-200 p-2 rounded-lg text-white dark:text-black"
        onClick={() => setItems(items + 5)}
      >
        {/* TODO: the hook isnt updating with the hight until you scroll */}
        Add 5 items
      </button>
      <ScrollableContainer autoHideDelay={1500} className="h-full">
        <div className="max-w-4xl mx-auto py-8 space-y-6">
          {Array.from({ length: items }).map((_, index) => (
            <ScrollableContainer
              key={index}
              className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Section {index + 1}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                This is a demo of the custom scrollbar implementation. The
                scrollbar will auto-hide and appear when you scroll or hover.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
            </ScrollableContainer>
          ))}
        </div>
      </ScrollableContainer>
    </div>
  );
}

export default App;
