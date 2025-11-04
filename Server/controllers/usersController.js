const User = require('../model/User');
const PracticeSession = require('../model/PracticeSession');
const Password_reset_token = require('../model/PasswordReset');
const {formatDateToIST} = require('../utils/formatDateToIST');

const getUser = async (req, res) => {
    const { id } = req.params;
    if(!id) return res.sendStatus(401);

    const verfiedId = req.user.id;    
    if(verfiedId !== id) return res.status(401).json({ message: "Not allowed" });

    const userData = await User.findById(id,{name:1,email:1,passwordChangedAt:1,_id:0}).exec();
    if(!userData) return res.sendStatus(403);

    let user = userData.toObject();
    
    if(user.passwordChangedAt){ 
      const date = formatDateToIST(user.passwordChangedAt);
      user.passwordChangedAt = date;
    }  
    res.status(200).json({user});
}

const updateUser = async (req, res) => {
    try {
    const { id } = req.params;
    if(!id) return res.sendStatus(401);
    
    const verfiedId = req.user.id;  
    if(verfiedId !== id) return res.status(401).json({ message: "Not allowed" });

    const {name} = req?.body;
    if(!name) return res.status(401).json({message:'empty field'});

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: {name} },
      { new: true, runValidators: true }
    ).select("name -_id");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }

    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    res.status(500).json({ error: "Server error", message: err.message });
  }
}

const deleteUser = async (req, res) => {

  const isProduction = process.env.NODE_ENV === 'production';
  const REFRESH_TOKEN_COOKIE_NAME = 'secure_t';

  try {
    const { id } = req.params;
    const verfiedId = req.user.id;
    if (verfiedId !== id) return res.status(401).json({ message: "Not allowed" });
    const user = await User.findById(verfiedId);

    await PracticeSession.deleteMany({ email: user.email });
    await Password_reset_token.deleteMany({ email: user.email });

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      domain: process.env.COOKIE_DOMAIN_NAME,
      secure: isProduction, // only send over HTTPS in production
      sameSite: isProduction ? 'None' : 'Lax', // change to 'None' if cross-site and ensure secure:true
    });
          
    res.status(200).json({
      message: "User deleted successfully.",
      deletedUser: {
        _id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email,
      },
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        error: "Invalid ID format",
      });
    }

    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
}


module.exports = {
  getUser,
  updateUser,
  deleteUser
}