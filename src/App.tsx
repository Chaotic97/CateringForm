import { useFormStore } from './store/useFormStore';
import { WizardShell } from './components/layout/WizardShell';
import { StepContainer } from './components/layout/StepContainer';
import { Welcome } from './steps/Welcome';
import { EventDetails } from './steps/buyout/EventDetails';
import { MenuStyle } from './steps/buyout/MenuStyle';
import { ContactInfo as BuyoutContactInfo } from './steps/buyout/ContactInfo';
import { EstimatePreview } from './steps/buyout/EstimatePreview';
import { DishSelection } from './steps/togo/DishSelection';
import { ContactInfo as ToGoContactInfo } from './steps/togo/ContactInfo';
import { PriceSummary } from './steps/togo/PriceSummary';
import { Confirmation } from './steps/Confirmation';

const BUYOUT_LABELS = ['Type', 'Details', 'Menu', 'Contact', 'Estimate'];
const TOGO_LABELS = ['Type', 'Order', 'Contact', 'Summary'];

function App() {
  const { cateringType, currentStep, prevStep } = useFormStore();

  const isBuyout = cateringType === 'buyout';
  const isToGo = cateringType === 'togo';

  const stepLabels = isBuyout ? BUYOUT_LABELS : isToGo ? TOGO_LABELS : [];
  const totalSteps = stepLabels.length;

  // Determine if we're on the confirmation step
  const buyoutConfirmStep = 5;
  const togoConfirmStep = 4;
  const isConfirmation =
    (isBuyout && currentStep === buyoutConfirmStep) ||
    (isToGo && currentStep === togoConfirmStep);

  const showProgress = currentStep > 0 && !isConfirmation;

  function renderStep() {
    // Step 0: Welcome (shared)
    if (currentStep === 0) return <Welcome />;

    // Confirmation
    if (isConfirmation) return <Confirmation />;

    // Buyout flow
    if (isBuyout) {
      switch (currentStep) {
        case 1: return <EventDetails />;
        case 2: return <MenuStyle />;
        case 3: return <BuyoutContactInfo />;
        case 4: return <EstimatePreview />;
      }
    }

    // To-Go flow
    if (isToGo) {
      switch (currentStep) {
        case 1: return <DishSelection />;
        case 2: return <ToGoContactInfo />;
        case 3: return <PriceSummary />;
      }
    }

    return <Welcome />;
  }

  return (
    <WizardShell
      currentStep={currentStep}
      totalSteps={totalSteps}
      stepLabels={stepLabels}
      showProgress={showProgress}
      onBack={currentStep > 0 && !isConfirmation ? prevStep : undefined}
    >
      <StepContainer stepKey={currentStep}>
        {renderStep()}
      </StepContainer>
    </WizardShell>
  );
}

export default App;
