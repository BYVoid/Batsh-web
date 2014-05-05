// List files
files = readdir();

// Test existence
if (exists("file1.txt")) {
  println("file1.txt exists.");
}

existence = exists("file2.txt");
if (existence) {
  println("file2.txt exists.");
}

if (!exists("file3.txt")) {
  println("file3.txt does not exist.");
}
