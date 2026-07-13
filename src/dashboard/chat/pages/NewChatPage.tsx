import { ChatInput } from "../components/ChatInput";
import { randomWelcomePhrase } from "../helper/randomWelcomPhrases";

export const NewChat = () => {
  const welcomePhrase = randomWelcomePhrase();
  return (
    <>
      <div className="flex justify-center mb-4 mt-50 md:mt-70 w-full">
        <h1 className="text-4xl text-center font-light">{welcomePhrase}</h1>
      </div>
      <ChatInput newChat={true} />
    </>
  );
};
