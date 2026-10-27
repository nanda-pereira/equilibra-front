import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Hero from "./sections/Hero";
import ProblemSection from "./sections/ProblemSection";
import SolutionSection from "./sections/SolutionSection";
import ForWhomSection from "./sections/ForWhomSection";
import HowItWorksSection from "./sections/HowItWorksSection";
import CallToActionSection from "./sections/CallToActionSection";

function LandingPage() {
    return (
        <>
            <Header />
            <main>
                <Hero />
                <ProblemSection />
                <SolutionSection />
                <ForWhomSection />
                <HowItWorksSection />
                <CallToActionSection />
            </main>
            <Footer />
        </>
    );
}

export default LandingPage;