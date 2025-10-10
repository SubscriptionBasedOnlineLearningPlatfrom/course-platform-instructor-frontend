import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/createCourse/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/createCourse/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../components/createCourse/ui/form";
import { Input } from "../components/createCourse/ui/input";
import { Textarea } from "../components/createCourse/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/createCourse/ui/select";
import { ArrowLeft, Plus, BookOpen, Trophy, Clock, DollarSign, Upload, X, Image } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { courseAPI } from "../services/api";

const courseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  level: z.string().min(1, "Please select a level"),
  duration: z.string().optional().refine((val) => {
    if (!val || val === "") return true; // Allow empty
    const num = parseInt(val);
    return !isNaN(num) && num > 0;
  }, "Duration must be a positive number"),
  requirements: z.string().optional(),
});

const CreateCourse = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const fileInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      level: "",
      duration: "",
      requirements: "",
    },
  });

  // Handle thumbnail file selection
  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setThumbnailFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove thumbnail
  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Please login first");
        navigate("/");
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all form fields
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });

      // Add thumbnail if selected
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      // Send data to backend using fetch (axios doesn't handle FormData well with files)
      const response = await fetch('http://localhost:4000/instructor/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create course');
      }

      const result = await response.json();

      toast.success("Course created successfully!");
      console.log("Created course:", result.data);
      
      // Navigate to view created courses page to see the new course
      navigate("/view-courses");
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error(error.message || "Failed to create course. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 bg-blue-100 p-8 relative overflow-hidden">
      {/* Animated floating gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-blue-100 opacity-30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-24 w-32 h-32 bg-blue-100 opacity-20 rounded-full blur-2xl animate-float-slow"></div>
        <div className="absolute bottom-28 left-1/3 w-44 h-44 bg-blue-100 opacity-20 rounded-full blur-3xl animate-float"></div>
      </div>

      <main className="w-full max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center gap-6 mb-12">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="bg-blue-100 hover:text-sky-100 transition transform hover:scale-110"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r bg-blue-400 bg-clip-text text-transparent drop-shadow-lg">
              Create New Course
            </h1>
            <p className="text-lg text-sky-800 opacity-80">
              Share your knowledge with a bright, engaging course experience 🌐
            </p>
          </div>
        </div>

        {/* Card */}
        <Card className="bg-white/40 backdrop-blur-xl border border-sky-200 shadow-2xl rounded-2xl overflow-hidden animate-fade-in">
          <CardHeader className="bg-gradient-to-r bg-blue-400 text-white p-10 shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">Course Information</CardTitle>
                <CardDescription className="text-white/80 mt-1 text-lg">
                  Build an inspiring and impactful course 🚀
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-10 space-y-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Title / Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sky-700 font-semibold">Course Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g. React Masterclass 🚀"
                            {...field}
                            className="h-14 text-lg rounded-xl bg-white/80 border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-300 transition"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sky-700 font-semibold">Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-14 rounded-xl bg-white/80 border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-300">
                              <SelectValue placeholder="Choose a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="programming">💻 Programming & Dev</SelectItem>
                            <SelectItem value="design">🎨 Design</SelectItem>
                            <SelectItem value="business">💼 Business</SelectItem>
                            <SelectItem value="language">🌍 Language</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-700 font-semibold">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What will students achieve from this course?"
                          {...field}
                          className="min-h-[120px] bg-white/80 text-lg rounded-xl border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-300 transition"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Course Thumbnail */}
                <div className="space-y-4">
                  <FormLabel className="text-sky-700 font-semibold">Course Thumbnail</FormLabel>
                  <FormDescription className="text-sky-600">
                    Upload an attractive thumbnail image for your course (Max: 5MB, JPG/PNG)
                  </FormDescription>
                  
                  {!thumbnailPreview ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-sky-300 rounded-xl p-8 text-center bg-white/60 hover:bg-white/80 cursor-pointer transition-all duration-300 hover:border-sky-400"
                    >
                      <Upload className="h-12 w-12 text-sky-400 mx-auto mb-4" />
                      <p className="text-sky-700 font-medium text-lg mb-2">
                        Click to upload course thumbnail
                      </p>
                      <p className="text-sky-500 text-sm">
                        JPG, PNG up to 5MB
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="border-2 border-sky-300 rounded-xl p-4 bg-white/60">
                        <img 
                          src={thumbnailPreview} 
                          alt="Course thumbnail preview" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeThumbnail}
                        className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </div>

                {/* Level / Duration */}
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sky-700 font-semibold">Difficulty Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl bg-white/80 border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-300">
                              <SelectValue placeholder="Level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Beginner">🌱 Beginner</SelectItem>
                            <SelectItem value="Intermediate">🚀 Intermediate</SelectItem>
                            <SelectItem value="Advanced">⚡ Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sky-700 font-semibold">Duration (hours) <span className="text-gray-500 font-normal">(optional)</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="e.g., 25"
                            {...field}
                            className="h-12 rounded-xl bg-white/80 border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-300"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Requirements */}
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-700 font-semibold">Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional: What should students know before starting?"
                          {...field}
                          className="min-h-[100px] bg-white/80 rounded-xl border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-300"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-sky-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="px-6 py-3 border-sky-300 text-sky-700 rounded-xl hover:bg-sky-100 transition"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" /> Back
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-10 py-3 rounded-xl bg-gradient-to-r bg-blue-400 text-white font-semibold shadow-lg hover:opacity-90 transition animate-pulse"
                  >
                    {isSubmitting ? "Creating..." : "🚀 Launch Course"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateCourse;
