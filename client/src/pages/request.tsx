import { motion } from "framer-motion";
import { Coffee, Building2, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFeatureRequestSchema, type InsertFeatureRequest } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function RequestPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InsertFeatureRequest>({
    resolver: zodResolver(insertFeatureRequestSchema),
    defaultValues: {
      type: "drink",
      name: "",
      details: "",
      submitterEmail: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertFeatureRequest) => {
      await apiRequest("POST", "/api/requests", {
        ...data,
        submitterEmail: data.submitterEmail?.trim() || undefined,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Request submitted!",
        description: "Thank you for your suggestion. We'll review it soon.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold">Thank You!</h1>
          <p className="text-muted-foreground max-w-md">
            Your request has been submitted successfully. We'll review it and may add it to the app if it fits CaffiTrack.
          </p>
          <div className="pt-4">
            <Button variant="outline" onClick={() => setSubmitted(false)} data-testid="button-submit-another">
              Submit Another
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Request a <span className="text-primary">New Item</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Can't find your favorite drink or coffee chain? Let us know and we'll consider adding it.
            </p>
          </div>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Submit Your Request</CardTitle>
              <CardDescription>
                Tell us what you'd like to see added to CaffiTrack
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Label>What would you like to add?</Label>
                  <RadioGroup
                    defaultValue="drink"
                    onValueChange={(value) => form.setValue("type", value as "drink" | "chain")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="drink" id="drink" data-testid="radio-drink" />
                      <Label htmlFor="drink" className="flex items-center gap-2 cursor-pointer">
                        <Coffee className="h-4 w-4 text-primary" />
                        A Drink
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="chain" id="chain" data-testid="radio-chain" />
                      <Label htmlFor="chain" className="flex items-center gap-2 cursor-pointer">
                        <Building2 className="h-4 w-4 text-primary" />
                        A Coffee Chain
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    {...form.register("name")}
                    id="name"
                    placeholder="e.g., Iced Caramel Macchiato or Blue Bottle Coffee"
                    className="bg-white/5 border-white/10 focus:border-primary"
                    data-testid="input-request-name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">Additional Details</Label>
                  <Textarea
                    {...form.register("details")}
                    id="details"
                    placeholder="Any additional information (e.g., caffeine content, sizes available, location)"
                    className="bg-white/5 border-white/10 focus:border-primary min-h-[100px]"
                    data-testid="textarea-request-details"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Your Email (optional)</Label>
                  <Input
                    {...form.register("submitterEmail")}
                    id="email"
                    type="email"
                    placeholder="We'll notify you when your request is approved"
                    className="bg-white/5 border-white/10 focus:border-primary"
                    data-testid="input-request-email"
                  />
                  {form.formState.errors.submitterEmail && (
                    <p className="text-sm text-red-500">{form.formState.errors.submitterEmail.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-black hover:bg-primary/90 font-bold h-12"
                  disabled={mutation.isPending}
                  data-testid="button-submit-request"
                >
                  {mutation.isPending ? "Submitting..." : "Submit Request"}
                  {!mutation.isPending && <Send className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
