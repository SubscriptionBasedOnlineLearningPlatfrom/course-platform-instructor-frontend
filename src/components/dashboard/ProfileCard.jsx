import { Card, CardContent } from "../dashboard1/ui/card.jsx";
import { Mail } from "lucide-react";

export const ProfileCard = () => {
  const userName = "John Doe";
  const userEmail = "john.doe@email.com";

  return (
    <Card className="w-full bg-blue-100 border border-blue-200 shadow-md rounded-xl">
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
        <h1 className="text-4xl font-extrabold text-blue-900">Hello, {userName}</h1>
        <div className="flex items-center gap-3 text-blue-800 text-lg font-bold">
          <Mail className="h-6 w-6" />
          <span>{userEmail}</span>
        </div>
      </CardContent>
    </Card>
  );
};
