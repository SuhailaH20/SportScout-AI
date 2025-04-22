// control.js
const FormSubmission = require('../modelss/BusinessSchema'); 
const bcrypt = require('bcrypt');
const axios = require('axios');
const { logout } = require('../middlewares/auth');
const { Scout, Player } = require('../modelss/Schema');
const TestResult = require('../modelss/FormSubmission');


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



    // Combine data from both sources
    const combinedData = [...formSubmissions];

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



const submitTest = async (req, res) => {
    console.log('تم استدعاء دالة submitTest');
    try {
        console.log('بيانات الطلب (req.body):', req.body);

        const {
            q1, q2, q3, q4, q5,
            q6, q7, q8, q9, q10,
            q11, q12, q13, q14, q15,
            q16, q17, q18, q19, q20, q21,
            goals, assists, rating, matches,
            timeTaken 
        } = req.body;

        console.log('معرف المستخدم في الجلسة:', req.session.userId);

        if (!req.session.userId) {
            console.log('خطأ: المستخدم غير مصادق');
            return res.status(401).send('User not authenticated');
        }

        let timeTakenInSeconds = 0;

        if (timeTaken && typeof timeTaken === 'string') {
            const parts = timeTaken.split(':');
            if (parts.length === 2) {
                const minutes = parseInt(parts[0], 10);
                const seconds = parseInt(parts[1], 10);
                if (!isNaN(minutes) && !isNaN(seconds)) {
                    timeTakenInSeconds = (minutes * 60) + seconds;
                } else {
                    console.error("فشل في تحويل وقت الاختبار إلى ثواني:", timeTaken);
                    timeTakenInSeconds = 0;
                }
            } else {
                console.error("تنسيق وقت الاختبار غير صالح:", timeTaken);
                timeTakenInSeconds = 0; 
            }
        } else if (typeof timeTaken === 'number') {
            timeTakenInSeconds = timeTaken; 
        }

        const newResult = new TestResult({
            userId: req.session.userId,
            q1, q2, q3, q4, q5,
            q6, q7, q8, q9, q10,
            q11, q12, q13, q14, q15,
            q16, q17, q18, q19, q20, q21,
            timeTaken: timeTakenInSeconds , goals, assists, rating, matches
        });
        console.log("إحصائيات اللاعب:", { goals, assists, rating, matches });
        console.log('TestResult قبل الحفظ:', newResult);

        await newResult.save();
        console.log('تم حفظ البيانات بنجاح');
        res.redirect('/pages/success.html');
    } catch (err) {
        console.error("فشل الحفظ:", err);
        res.status(500).send(`حدث خطأ أثناء حفظ البيانات: ${err.message}`);
    }
};


const registerUser = async (req, res) => {
    try {
        const { name, phoneNumber, email, password, accountType, birthdate, organization, experience, location } = req.body;

        // تحقق من الحقول الأساسية المشتركة
        if (!name || !phoneNumber || !email || !password || !accountType || !location) {
            return res.status(400).json({ message: 'جميع الحقول الأساسية مطلوبة' });
        }

        const existingScoutByPhone = await Scout.findOne({ phoneNumber });
        const existingScoutByEmail = await Scout.findOne({ email });
        const existingPlayerByPhone = await Player.findOne({ phoneNumber });
        const existingPlayerByEmail = await Player.findOne({ email });

        if ((accountType === 'scout' && (existingScoutByPhone || existingScoutByEmail)) ||
            (accountType === 'player' && (existingPlayerByPhone || existingPlayerByEmail))) {
            return res.status(409).json({ message: `رقم الهاتف أو البريد الإلكتروني مسجل مسبقًا` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (accountType === 'scout') {
            if (!organization || !experience) {
                return res.status(400).json({ message: 'جميع حقول الكشاف مطلوبة' });
            }
            const newScout = new Scout({
                name,
                phoneNumber,
                email,
                password: hashedPassword,
                organization,
                experience: parseInt(experience),
                location,
                accountType
            });
            await newScout.save();
            return res.redirect('/pages/login.html');
        } else if (accountType === 'player') {
            if (!birthdate) {
                return res.status(400).json({ message: 'جميع حقول اللاعب مطلوبة' });
            }
            const newPlayer = new Player({
                name,
                phoneNumber,
                email,
                password: hashedPassword,
                birthdate,
                location,
                accountType
            });
            await newPlayer.save();
            return res.redirect('/pages/login.html');
        } else {
            return res.status(400).json({ message: 'نوع الحساب غير صالح' });
        }

    } catch (error) {
        console.error('Error registering user:', error);
        if (error.errors) {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: 'حدث خطأ في التحقق من البيانات', errors: validationErrors });
        }
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { indexrout, createGet, MainGet, submitForm,GetRecommendations,successGet,logout, submitTest, registerUser };