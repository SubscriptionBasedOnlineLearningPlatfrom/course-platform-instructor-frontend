declare module "react-quiz-component" {
  import * as React from "react";

  export interface QuizProps {
    quiz: any;
    shuffle?: boolean;
    showInstantFeedback?: boolean;
    showDefaultResult?: boolean;
    customResultPage?: (obj: any) => JSX.Element;
    onComplete?: (obj: any) => void;
  }

  const Quiz: React.FC<QuizProps>;
  export default Quiz;
}
