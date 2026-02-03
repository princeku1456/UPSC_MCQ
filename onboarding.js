const OnboardingManager = {
    steps: [
        {
            title: "Welcome to MCQ Practice! 🚀",
            content: "Your ultimate destination for mastering subjects through practice. Let's show you around!",
            icon: "👋"
        },
        {
            title: "Track Your Progress 📊",
            content: "Use the dashboard to monitor your tests, precision, and concept gaps. Identification is the first step to improvement.",
            icon: "📈"
        },
        {
            title: "AI-Powered Mentorship 🤖",
            content: "Get personalized feedback from our Gemini AI mentor to understand your weak spots and improve your strategy.",
            icon: "🧠"
        },
        {
            title: "Practice & Review 📝",
            content: "Take timed tests or practice casually. Review your answers with detailed explanations to learn effectively.",
            icon: "🎯"
        }
    ],
    currentStep: 0,

    async checkOnboardingStatus(user) {
        if (!user) return;
        try {
            // Wait for DB to be initialized if needed, though auth.js should have handled it.
            // We assume 'db' is available globally from auth.js or firebase init.
            // If db is not defined, we might need to get it from firebase.firestore()
            const firestore = firebase.firestore();
            const doc = await firestore.collection('users').doc(user.uid).get();

            // If user doc doesn't exist OR onboardingCompleted is missing/false
            if (!doc.exists || !doc.data().onboardingCompleted) {
                this.startOnboarding();
            }
        } catch (error) {
            console.error("Error checking onboarding status:", error);
        }
    },

    startOnboarding() {
        console.log("Starting onboarding...");
        this.currentStep = 0;
        this.renderStep();
        const modalEl = document.getElementById('onboardingModal');
        if (modalEl) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        } else {
            console.error("Onboarding modal element not found!");
        }
    },

    renderStep() {
        const step = this.steps[this.currentStep];
        document.getElementById('onboarding-icon').textContent = step.icon;
        document.getElementById('onboarding-title').textContent = step.title;
        document.getElementById('onboarding-content').textContent = step.content;

        // Update dots
        const dotsContainer = document.getElementById('onboarding-dots');
        dotsContainer.innerHTML = '';
        this.steps.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = `dot ${index === this.currentStep ? 'active' : ''}`;
            dotsContainer.appendChild(dot);
        });

        // Update buttons
        const prevBtn = document.getElementById('onboarding-prev');
        const nextBtn = document.getElementById('onboarding-next');
        const finishBtn = document.getElementById('onboarding-finish');

        if (this.currentStep === 0) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'inline-block';
        }

        if (this.currentStep === this.steps.length - 1) {
            nextBtn.style.display = 'none';
            finishBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            finishBtn.style.display = 'none';
        }
    },

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.renderStep();
        }
    },

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep();
        }
    },

    async completeOnboarding() {
        const user = firebase.auth().currentUser;
        if (user) {
            try {
                const firestore = firebase.firestore();
                await firestore.collection('users').doc(user.uid).set({
                    onboardingCompleted: true
                }, { merge: true });

                // Hide modal
                const modalEl = document.getElementById('onboardingModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();

                toastr.success("You're all set! Happy practicing.");
            } catch (error) {
                console.error("Error saving onboarding status:", error);
                toastr.error("Could not save progress. Please try again.");
            }
        }
    }
};
