const registerUser = {
  firstName: "John",
  lastName: "Doe",
  email: "john_doe@yahoo.com",
  password: "1234",
  confirmPassword: "1234"
}

const editProfile = {
  firstName: "Clary",
  lastName: "Smith",
  email: "clary_f@yahoo.com",
  password: "1234"
}

const uploadBook = {
  title: "Book Title", 
  authors: ["Book author"], 
  description: "Lorem ipsum", 
  tags: ["SF", "Fantasy"], 
  publisher: "Publisher Name", 
  pubDate: "01/01/2016",
  language: "en",
  rating: 5,
  fileName: "book.epub",
  series: "Series Name"
}

const editBook = {
  title: "New Book Title",
  authors: ["Book author"],
  description: "Lorem ipsum",
  tags: ["SF", "Fantasy"],
  publisher: "Publisher Name",
  pubDate: "01/01/2016",
  language: "en",
  rating: 5,
  fileName: "book.epub",
  series: "Series Name"
}

const addHighlight = {
  text: "test",
  cfiRange: "",
  color: "yellow",
  note: "Test"
}

const editHighlight = {
  text: "test",
  cfiRange: "",
  color: "yellow",
  note: "Test"
}

const addRead = {
  startDate: "2022-03-12",
  endDate: "2022-03-15", 
  rating: 5, 
  notes: "Good book"
}

const editRead = {
  startDate: "2022-03-12",
  endDate: "2022-03-15",
  rating: 4,
  notes: "Bad book"
}

const addSession = {
  startDate: "2022-04-02",
  time: {
    hours: "1",
    minutes: "30"
  }
}

const editSession = {
  startDate: "2022-04-02",
  time: {
    hours: "2",
    minutes: "30"
  }
}

const editAppearanceSettings = { 
  darkTheme: false, 
  fontSize: 120, 
  readerTheme: "sepia"
}

const editPrivacySettings = { 
  notifications: true, 
  profileVisibility: "all", 
  showGoals: true, 
  showBooks: false, 
  showNumbers: false 
}

const editGoals = { 
  yearly: 10, 
  monthly: 2, 
  dailyHours: 1, 
  dailyMinutes: 30 
} 

module.exports = {
  uploadBook,
  registerUser,
  editBook,
  addHighlight,
  editHighlight,
  addRead,
  editRead,
  addSession,
  editSession,
  editProfile,
  editAppearanceSettings,
  editPrivacySettings,
  editGoals
}