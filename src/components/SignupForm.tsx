import React from 'react';
import { Heart, ArrowRight, Loader2 } from 'lucide-react';

interface SignupFormProps {
  name: string;
  monthlyAmount: string;
  isSubmitting: boolean;
  showSuccess: boolean;
  onNameChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({
  name,
  monthlyAmount,
  isSubmitting,
  showSuccess,
  onNameChange,
  onAmountChange,
  onSubmit
}) => {
  return (
    <div className="arc-form-container">
      <div className="arc-form">
        <div className="arc-form__header">
          <h2 className="arc-form__title">Join the Movement</h2>
        </div>

        {showSuccess && (
          <div className="arc-form__success">
            <Heart className="arc-form__success-icon" />
            <span>Thank you for supporting Arc!</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="arc-form__fields">
          <div className="arc-form__group">
            <label htmlFor="name" className="arc-form__label">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="arc-form__input"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="arc-form__group">
            <div className="arc-form__slider-header">
              <label htmlFor="amount" className="arc-form__label">
                Price Suggestion
              </label>
              <div className="arc-form__value-badge">
                ${parseInt(monthlyAmount || '12', 10)}/month
              </div>
            </div>
            
            <div className="arc-form__slider-container">
              <div className="arc-form__slider-track">
                <div className="arc-form__slider-ticks">
                  {Array.from({ length: 15 }, (_, i) => (
                    <div key={i + 5} className="arc-form__slider-tick" />
                  ))}
                </div>
                <input
                  type="range"
                  id="amount"
                  min={5}
                  max={19}
                  step={1}
                  value={monthlyAmount || '12'}
                  onChange={(e) => onAmountChange(e.target.value)}
                  className="arc-slider"
                  aria-valuemin={5}
                  aria-valuemax={19}
                  aria-valuenow={parseInt(monthlyAmount || '12', 10)}
                />
                <div className="arc-form__slider-fill" style={{
                  width: `${((parseInt(monthlyAmount || '12', 10) - 5) / (19 - 5)) * 100}%`
                }} />
              </div>
              
              <div className="arc-form__slider-labels">
                <span className="arc-form__slider-label">$5</span>
                <span className="arc-form__slider-label">$19</span>
              </div>
            </div>
            <p className="arc-form__hint">If Arc became a paid product with Dia’s features, what would you be willing to pay per month?</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !monthlyAmount}
            className="arc-form__submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="arc-form__submit-icon arc-form__submit-icon--spin" />
                <span>Adding your voice...</span>
              </>
            ) : (
              <>
                <span>Count Me In</span>
                <ArrowRight className="arc-form__submit-icon" />
              </>
            )}
          </button>
        </form>


      </div>
    </div>
  );
};

export default SignupForm;