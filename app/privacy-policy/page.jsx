import Policy from "./components/Policy"
import PrivacyBanner from "./components/PrivacyBanner"

const privacyPolicy = () => {
    return (
        <div>
            <PrivacyBanner />
            <Policy />
        </div>
    )
}

export default privacyPolicy