// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const dashboard = document.getElementById('dashboard');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');

// Form Elements
const loginFormElement = document.getElementById('loginForm');
const signupFormElement = document.getElementById('signupForm');

// Form Fields
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const signupName = document.getElementById('signupName');
const signupEmail = document.getElementById('signupEmail');
const signupEnrollment = document.getElementById('signupEnrollment');
const signupPassword = document.getElementById('signupPassword');
const signupConfirmPassword = document.getElementById('signupConfirmPassword');

// Switch between login and signup forms
showSignup.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.style.display = 'none';
  signupForm.style.display = 'block';
});

showLogin.addEventListener('click', (e) => {
  e.preventDefault();
  signupForm.style.display = 'none';
  loginForm.style.display = 'block';
});

// Handle login form submission
loginFormElement.addEventListener('submit', (e) => {
  e.preventDefault();
  loginError.style.display = 'none';
  
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  
  // Validate email and password
  if (!email) {
    loginError.textContent = 'Email is required';
    loginError.style.display = 'block';
    return;
  }
  
  if (!password) {
    loginError.textContent = 'Password is required';
    loginError.style.display = 'block';
    return;
  }
  
  // Email format validation
  if (!validateEmail(email)) {
    loginError.textContent = 'Please enter a valid email address';
    loginError.style.display = 'block';
    return;
  }
  
  // Show loading indicator in the button
  const loginButton = loginFormElement.querySelector('button[type="submit"]');
  const originalButtonText = loginButton.textContent;
  loginButton.textContent = 'Logging in...';
  loginButton.disabled = true;
  
  // Sign in with Firebase
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log('Login successful');
      // Clear form
      loginFormElement.reset();
      // Reset button
      loginButton.textContent = originalButtonText;
      loginButton.disabled = false;
    })
    .catch((error) => {
      console.error('Login error:', error.code, error.message);
      
      // Reset button
      loginButton.textContent = originalButtonText;
      loginButton.disabled = false;
      
      // Display user-friendly error message
      if (error.code === 'auth/invalid-login-credentials' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential') {
        loginError.textContent = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/user-disabled') {
        loginError.textContent = 'This account has been disabled. Please contact support.';
      } else if (error.code === 'auth/too-many-requests') {
        loginError.textContent = 'Too many failed login attempts. Please try again later or reset your password.';
      } else if (error.code === 'auth/network-request-failed') {
        loginError.textContent = 'Network error. Please check your internet connection and try again.';
      } else {
        loginError.textContent = `Login failed: ${error.message}`;
      }
      loginError.style.display = 'block';
    });
});

// Handle signup form submission
signupFormElement.addEventListener('submit', async (e) => {
  e.preventDefault();
  signupError.style.display = 'none';
  
  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const enrollment = signupEnrollment.value.trim();
  const password = signupPassword.value;
  const confirmPassword = signupConfirmPassword.value;
  
  // Validate all fields are filled
  if (!name) {
    signupError.textContent = 'Full Name is required';
    signupError.style.display = 'block';
    return;
  }
  
  if (!email) {
    signupError.textContent = 'Email is required';
    signupError.style.display = 'block';
    return;
  }
  
  if (!enrollment) {
    signupError.textContent = 'Enrollment Number is required';
    signupError.style.display = 'block';
    return;
  }
  
  // Validate enrollment number format (12 digits, integers only)
  if (!/^\d{12}$/.test(enrollment)) {
    signupError.textContent = 'Enrollment number must be exactly 12 digits and contain only numbers';
    signupError.style.display = 'block';
    return;
  }
  
  if (!password) {
    signupError.textContent = 'Password is required';
    signupError.style.display = 'block';
    return;
  }
  
  if (!confirmPassword) {
    signupError.textContent = 'Please confirm your password';
    signupError.style.display = 'block';
    return;
  }
  
  // Validate email format
  if (!validateEmail(email)) {
    signupError.textContent = 'Please enter a valid email address';
    signupError.style.display = 'block';
    return;
  }
  
  // Validate passwords match
  if (password !== confirmPassword) {
    signupError.textContent = 'Passwords do not match';
    signupError.style.display = 'block';
    return;
  }
  
  // Validate password length
  if (password.length < 6) {
    signupError.textContent = 'Password should be at least 6 characters';
    signupError.style.display = 'block';
    return;
  }
  
  // Show loading indicator
  const signupButton = signupFormElement.querySelector('button[type="submit"]');
  const originalButtonText = signupButton.textContent;
  signupButton.textContent = 'Creating Account...';
  signupButton.disabled = true;
  
  try {
    // First check if enrollment number is already used
    console.log('Checking if enrollment number is already used...');
    const enrollmentDoc = await db.collection('enrollmentConstraints').doc(enrollment).get();
    
    if (enrollmentDoc.exists) {
      console.log('Enrollment number already exists');
      signupError.textContent = 'This enrollment number is already registered. Please use a different enrollment number.';
      signupError.style.display = 'block';
      signupButton.textContent = originalButtonText;
      signupButton.disabled = false;
      return;
    }
    
    // Create user in Firebase Authentication
    console.log('Enrollment is available. Creating authentication user...');
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Check if user was created successfully
    if (!user) {
      signupError.textContent = 'Failed to create user account';
      signupError.style.display = 'block';
      signupButton.textContent = originalButtonText;
      signupButton.disabled = false;
      return;
    }
    
    console.log('User created:', user.uid);
    
    try {
      console.log('Adding user data to Firestore...');
      
      // Use a batch write instead of a transaction for better performance
      const batch = db.batch();
      
      // Create the enrollment constraint
      const enrollmentRef = db.collection('enrollmentConstraints').doc(enrollment);
      batch.set(enrollmentRef, {
        uid: user.uid,
        createdAt: new Date()
      });
      
      // Add the user data
      const userRef = db.collection('users').doc(user.uid);
      batch.set(userRef, {
        name: name,
        email: email,
        enrollment: enrollment,
        createdAt: new Date(),
        role: 'user'
      });
      
      // Commit the batch
      await batch.commit();
      
      console.log('User data added successfully');
      
      // Clear form
      signupFormElement.reset();
      
      // Reset button
      signupButton.textContent = originalButtonText;
      signupButton.disabled = false;
      
      // Show success message
      signupError.textContent = 'Account created successfully! Redirecting to dashboard...';
      signupError.style.backgroundColor = 'rgba(6, 214, 160, 0.1)';
      signupError.style.color = '#06d6a0';
      signupError.style.borderLeftColor = '#06d6a0';
      signupError.style.display = 'block';
      
      // Auto redirect to dashboard after a brief delay
      setTimeout(() => {
        signupError.style.display = 'none';
        signupError.style.backgroundColor = '';
        signupError.style.color = '';
        signupError.style.borderLeftColor = '';
      }, 3000);
      
    } catch (firestoreError) {
      // If there's an error with Firestore, delete the auth user to be consistent
      console.error('Firestore error:', firestoreError);
      
      // Reset button
      signupButton.textContent = originalButtonText;
      signupButton.disabled = false;
      
      try {
        await user.delete();
      } catch (deleteError) {
        console.error('Error deleting user after Firestore error:', deleteError);
      }
      
      if (firestoreError.code === 'permission-denied') {
        signupError.textContent = 'Registration failed: Permission denied. Please make sure your Firebase security rules allow write access to the users collection.';
      } else {
        signupError.textContent = `Registration failed: ${firestoreError.message}`;
      }
      signupError.style.display = 'block';
    }
  } catch (error) {
    console.error('Auth error:', error);
    
    // Reset button
    signupButton.textContent = originalButtonText;
    signupButton.disabled = false;
    
    // Display error message with user-friendly text
    if (error.code === 'auth/email-already-in-use') {
      signupError.textContent = 'This email is already registered. Please use a different email or try logging in.';
    } else if (error.code === 'auth/invalid-email') {
      signupError.textContent = 'Please enter a valid email address.';
    } else if (error.code === 'auth/weak-password') {
      signupError.textContent = 'Password is too weak. Please use a stronger password.';
    } else {
      signupError.textContent = error.message;
    }
    signupError.style.display = 'block';
  }
});

// Email validation function
function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

// Handle logout
logoutBtn.addEventListener('click', () => {
  auth.signOut()
    .then(() => {
      // Signed out successfully
    })
    .catch((error) => {
      console.error('Error signing out:', error);
    });
});

// Listen for authentication state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    loginForm.style.display = 'none';
    signupForm.style.display = 'none';
    dashboard.style.display = 'block';
    
    // Get user data from Firestore
    db.collection('users').doc(user.uid).get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          userName.textContent = `Welcome, ${userData.name}`;
        } else {
          userName.textContent = `Welcome, User`;
        }
      })
      .catch((error) => {
        console.error('Error getting user data:', error);
      });
  } else {
    // User is signed out
    dashboard.style.display = 'none';
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  }
}); 