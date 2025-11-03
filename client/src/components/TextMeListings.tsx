import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare } from "lucide-react";

export function TextMeListings() {
  const [showMessage, setShowMessage] = useState(false);

  const handleClick = () => {
    setShowMessage(true);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Send Me Listings</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleClick}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Mail className="h-4 w-4" />
            Email Me Listings
          </Button>
          <Button
            onClick={handleClick}
            className="flex items-center gap-2"
            variant="outline"
          >
            <MessageSquare className="h-4 w-4" />
            Text Me Listings
          </Button>
        </div>
        {showMessage && (
          <p className="text-muted-foreground mt-4">
            Coming soon! Thanks for your interest.
          </p>
        )}
      </div>
    </Card>
  );
}
