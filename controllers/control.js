// control.js
const User = require('../modelss/Schema');
const FormSubmission = require('../modelss/BusinessSchema'); 
const SavedRecommendation = require('../modelss/SavedRecommendation');  
const bcrypt = require('bcrypt');
const axios = require('axios');
const { logout } = require('../middlewares/auth');


const indexrout = (req, res) => {
    const userName = req.session.userName || 'تسجيل دخول'; // Ensure userName is defined
    res.render("index", { userName }); // Pass userName to the view
}
// GET Requests
// إنشاء حساب
const createGet = (req, res) => {
    res.render("pages/createAccount", {});
}

// Get request form
const MainGet = async (req, res) => {
  try {
    // Fetch external data
    const response = await axios.get('http://localhost:5001/');
    const activities = response.data.activities;
    const neighborhoods = response.data.neighborhoods;
    const userName = req.session.userName;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).send('User not authenticated');
    }

    // Fetch data from FormSubmission collection
    const formSubmissions = await FormSubmission.find({ userId }).lean();

    // Parse step4Result for each form submission and add the location info
    formSubmissions.forEach(item => {
      item.type = 'طلب مدخل';
      
      // Parse step4Result string into a JavaScript object
      if (item.step4Result) {
        const step4Data = JSON.parse(item.step4Result);
        
        // Extract relevant location data from step4Result
        if (step4Data[0]) {
          item.location = {
            lat: step4Data[0].lat,
            lng: step4Data[0].lng,
            nearbyPOIs: step4Data[0].nearby_pois
          };
        }
      }
    });

    // Fetch data from SavedRecommendation collection
    const savedRecommendations = await SavedRecommendation.find({ userId }).lean();
    savedRecommendations.forEach(item => {
      item.type = 'اقتراح';
    });

    // Combine data from both sources
    const combinedData = [...formSubmissions, ...savedRecommendations];

    // Pass everything to the EJS view, including combined data and location details
    res.render('pages/Main', { activities, neighborhoods, userName, combinedData });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
};


//Get Recommendations
const GetRecommendations = async (req, res) => {
  const { activity_type, neighborhood, lat, lng } = req.query;  // Include lat and lng

  try {
      const flaskResponse = await axios.get('http://localhost:5001/get_recommendations', {
          params: { activity_type, neighborhood, lat, lng }
      });
      res.json(flaskResponse.data);
  } catch (error) {
      console.error('Error fetching data from Flask:', error);
      res.status(500).json({ error: 'Error fetching recommendations.' });
  }
};

//Get success
    const successGet = async (req, res) => {
            res.render('pages/success');
    };


// POST requests
const createPost = async (req, res) => {
  try {
    const { name, phoneNumber, email, password } = req.body;
    console.log('Received phoneNumber:', phoneNumber);
    
    if (!name || !phoneNumber || !email || !password) {
        return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    const namePattern = /^([\u0621-\u064A]+\s?){2,3}$|^([a-zA-Z]+\s?){2,3}$/;
    const nameParts = name.trim().split(/\s+/); 

    if (nameParts.length < 3 || nameParts.length > 3 || !namePattern.test(name)) {
        return res.status(400).json({ message: 'الرجاء مطابقة شروط الاسم' });
    }

    const trimmedPassword = password.trim();
    if (!trimmedPassword || 
        trimmedPassword.length < 8 || 
        !/[A-Z]/.test(trimmedPassword) || 
        !/[a-z]/.test(trimmedPassword) || 
        !/[0-9]/.test(trimmedPassword)) {
        return res.status(400).json({ message: 'الرجاء مطابقة شروط كلمة المرور' });
    }
   
    const trimmedPhoneNumber = phoneNumber.trim();

    const phonePattern = /^\d{10}$/;
    if (!phonePattern.test(trimmedPhoneNumber)) {
        return res.status(400).json({ message: 'الرجاء مطابقة شروط رقم الهاتف' });
    }

    const existingUserByPhone = await User.findOne({ phoneNumber: trimmedPhoneNumber });
    if (existingUserByPhone) {
        return res.json({ message: 'المستخدم مسجل مسبقا' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return res.status(400).json({ message: 'البريد الإلكتروني غير صالح.' });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const user = new User({
      name,
      phoneNumber: trimmedPhoneNumber,
      email,
      password: hashedPassword 
    });

    console.log('Saving user:', user);
    await user.save();
    return res.redirect('/pages/login.html');
    
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Controller function to handle form submission
const submitForm = async (req, res) => {
  try {
      const {
          businessType,
          subBusinessType,
          activityType,
          partOfLargerBuilding,
          buildingType,
          parkingSpaces,
          onCommercialStreet,
          logisticsArea,
          warehouseArea,
          step3Result,
          step3Status, 
          step4Result
      } = req.body;

      if (!req.session.userId) {
          return res.status(401).send('User not authenticated');
      }

      const formSubmission = new FormSubmission({
          userId: req.session.userId,
          businessType,
          subBusinessType,
          activityType,
          partOfLargerBuilding,
          buildingType,
          parkingSpaces: parkingSpaces ? parseInt(parkingSpaces, 10) : null,
          onCommercialStreet,
          logisticsArea,
          warehouseArea,
          step3Result,
          step3Status,  
          step4Result
      });
      console.log('Form submission data:', req.body);
      await formSubmission.save();
      res.redirect('/pages/success.html');
  } catch (error) {
      console.error('Error saving form data:', error);
      res.status(500).send('Internal Server Error');
  }
};

const saveRecommendation = async (req, res) => {
  try {
      const { userId, recommendation } = req.body;

      if (!recommendation || !recommendation.summary) {
          console.log('Incomplete recommendation data:', recommendation);
          return res.status(400).send('Recommendation data is incomplete.');
      }

     
      const normalizedNearbyPois = recommendation.nearby_pois.map(poi => 
          typeof poi === 'string' 
              ? { name: poi, type: 'unknown' }  // Assign a default `type` for string entries
              : poi  // Keep the original object if it's already in the correct format
      );

      const savedRecommendation = new SavedRecommendation({
          userId: req.session.userId,
          summary: recommendation.summary,
          success_rate: recommendation.success_rate,
          nearby_pois: normalizedNearbyPois, 
          competitors: recommendation.competitors,
          location: {
              lat: recommendation.lat,
              lng: recommendation.lng
          }
      });

      await savedRecommendation.save();
      res.status(200).send('Recommendation saved successfully');
  } catch (error) {
      console.error('Error saving recommendation:', error);
      res.status(500).send('Internal Server Error');
  }
};

const TestResult = require('../modelss/FormSubmission');

const submitTest = async (req, res) => {
    console.log('تم استدعاء دالة submitTest');
    try {
        console.log('بيانات الطلب (req.body):', req.body);

        const {
            q1, q2, q3, q4, q5,
            q6, q7, q8, q9, q10,
            q11, q12, q13, q14, q15,
            q16, q17, q18, q19, q20, q21,
            timeTaken 
        } = req.body;

        console.log('معرف المستخدم في الجلسة:', req.session.userId);

        if (!req.session.userId) {
            console.log('خطأ: المستخدم غير مصادق');
            return res.status(401).send('User not authenticated');
        }

        const newResult = new TestResult({
            userId: req.session.userId,
            q1, q2, q3, q4, q5,
            q6, q7, q8, q9, q10,
            q11, q12, q13, q14, q15,
            q16, q17, q18, q19, q20, q21,
            timeTaken: parseInt(timeTaken) 
        });

        console.log('كائن TestResult قبل الحفظ:', newResult);

        await newResult.save();
        console.log('تم حفظ البيانات بنجاح');
        res.redirect('/pages/success.html');
    } catch (err) {
        console.error("فشل الحفظ:", err);
        res.status(500).send(`حدث خطأ أثناء حفظ البيانات: ${err.message}`);
    }
};

module.exports = { indexrout, createPost, createGet, MainGet,saveRecommendation, submitForm,GetRecommendations,successGet,logout, submitTest };
