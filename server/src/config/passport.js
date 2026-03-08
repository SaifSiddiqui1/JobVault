const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: GitHubStrategy } = require('passport-github2');
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    state: true,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // Check if email already exists
        const email = profile.emails?.[0]?.value;
        if (email) {
            user = await User.findOne({ email });
            if (user) {
                user.googleId = profile.id;
                if (!user.photo && profile.photos?.[0]?.value) user.photo = profile.photos[0].value;
                await user.save();
                return done(null, user);
            }
        }

        // Create new user from Google profile
        const randomSuffix = crypto.randomInt(1000, 9999);
        const username = (email?.split('@')[0] || profile.displayName.toLowerCase().replace(/\s+/g, '')) + randomSuffix;
        user = await User.create({
            fullName: profile.displayName,
            username,
            email: email || `${profile.id}@google.com`,
            googleId: profile.id,
            photo: profile.photos?.[0]?.value,
            isEmailVerified: true,
        });
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ['user:email'],
    state: true,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ githubId: profile.id });
        if (user) return done(null, user);

        const email = profile.emails?.[0]?.value;
        if (email) {
            user = await User.findOne({ email });
            if (user) {
                user.githubId = profile.id;
                await user.save();
                return done(null, user);
            }
        }

        const randomSuffix = crypto.randomInt(1000, 9999);
        const username = (profile.username || 'user') + randomSuffix;
        user = await User.create({
            fullName: profile.displayName || profile.username,
            username,
            email: email || `${profile.id}@github.com`,
            githubId: profile.id,
            photo: profile.photos?.[0]?.value,
            isEmailVerified: !!email,
        });
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));
