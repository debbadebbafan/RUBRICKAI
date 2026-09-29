import React, { useState } from 'react';
import { X, BookOpen, Lightbulb, HelpCircle, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface StudentLearningGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

interface LearningTopic {
  id: string;
  title: string;
  simpleAnalogy: string;
  plainExplanation: string;
  whyInstructorsCare: string;
  quickExample: string;
}

const TOPICS: LearningTopic[] = [
  {
    id: 'data_leakage',
    title: 'Data Leakage',
    simpleAnalogy: 'Studying with the exact final exam questions before test day.',
    plainExplanation:
      'Data leakage happens when information from your test set accidentally sneaks into your training step. Your model appears to get 95% accuracy on your laptop, but when a real user gives it new data, it fails because it was "cheating" during study time.',
    whyInstructorsCare:
      'Instructors look for data leakage first because it invalidates all reported metrics. Common cause: running StandardScaler.fit_transform() across all data before splitting.',
    quickExample:
      'Fix: Split into train and test sets first. Fit your scaler ONLY on the train set (scaler.fit(X_train)), then use it to transform both.',
  },
  {
    id: 'model_evaluation',
    title: 'Model Evaluation',
    simpleAnalogy: 'Grading an essay with a thoughtful rubric instead of just counting the number of words.',
    plainExplanation:
      'Model evaluation means checking how well your machine-learning model actually works. If you are predicting rare events (like students failing or fraudulent credit cards), raw "accuracy" is misleading because guessing "nobody fails" already gives 90% accuracy.',
    whyInstructorsCare:
      'Graders want to see confusion matrices, precision, recall, and F1-score so they know your model can detect the minority class, not just the majority.',
    quickExample:
      'Fix: Use classification_report(y_test, y_pred) and confusion_matrix(y_test, y_pred) instead of relying solely on accuracy_score.',
  },
  {
    id: 'train_test_split',
    title: 'Train / Test Split',
    simpleAnalogy: 'Learning from textbook exercises (Train), then taking a quiz with questions you have never seen (Test).',
    plainExplanation:
      'You partition your data into two separate groups. You teach the model on the training group (usually 80%), and test it on the unseen group (usually 20%). This proves whether the model truly learned patterns or just memorized answers.',
    whyInstructorsCare:
      'Without an isolated test split, you cannot prove generalization. Graders also check for random_state=42 so results can be reproduced exactly.',
    quickExample:
      'Fix: X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)',
  },
  {
    id: 'reproducibility',
    title: 'Reproducibility & Random Seeds',
    simpleAnalogy: 'Following a recipe with exact measurements so anyone in the world gets the exact same cake.',
    plainExplanation:
      'Computers use pseudo-random numbers to shuffle data and train models. If you do not specify a "seed" (like random_state=42), your data will split differently and your accuracy will change every time someone runs your notebook.',
    whyInstructorsCare:
      'If your instructor downloads your notebook and gets 74% instead of the 88% you claimed in your report, you lose points. A random seed guarantees identical results.',
    quickExample:
      'Fix: Always set random_state=42 in train_test_split, RandomForestClassifier, and KFold.',
  },
  {
    id: 'cross_validation',
    title: 'Cross-Validation (K-Fold)',
    simpleAnalogy: 'Taking 5 practice quizzes from 5 different chapters to make sure you didn\'t just get lucky on one chapter.',
    plainExplanation:
      'Instead of splitting data just once, K-Fold splits your training data into 5 equal slices. It trains on 4 slices and tests on the 5th, repeating this 5 times. You take the average score, proving your model is reliable and didn\'t just get an easy test split.',
    whyInstructorsCare:
      'On small datasets (under 5,000 rows), a single train/test split can be lucky or unlucky. Cross-validation proves scientific stability.',
    quickExample:
      'Fix: scores = cross_val_score(model, X_train, y_train, cv=5, scoring="f1_macro")',
  },
  {
    id: 'overfitting',
    title: 'Overfitting',
    simpleAnalogy: 'Memorizing the exact answers to past exam flashcards without understanding the underlying math.',
    plainExplanation:
      'Overfitting occurs when your model learns the training data too well, including the noise and accidental flukes. It scores 100% on training data, but drops to 60% on new test data because it memorized rather than generalized.',
    whyInstructorsCare:
      'Overfitted models look great in student presentations but fail in real life. Regularization, tree pruning, and keeping models simple prevent this.',
    quickExample:
      'Fix: Limit tree depth (max_depth=5 in Random Forest), remove unique IDs from features, and compare train score vs test score.',
  },
  {
    id: 'class_imbalance',
    title: 'Class Imbalance',
    simpleAnalogy: 'A medical test for a disease that only 1 person in 1,000 has.',
    plainExplanation:
      'If 95% of students in your dataset pass and only 5% fail, your dataset has class imbalance. A lazy model can predict "Pass" every time and get 95% accuracy, but it is completely useless because it failed to catch even a single student who needed help.',
    whyInstructorsCare:
      'Graders expect you to notice this imbalance during Exploratory Data Analysis and use metrics like F1-Score or class weights.',
    quickExample:
      'Fix: Check df["target"].value_counts(normalize=True) and report Macro F1-Score instead of accuracy.',
  },
  {
    id: 'feature_engineering',
    title: 'Feature Engineering & Selection',
    simpleAnalogy: 'Calculating "speed = distance / time" before trying to guess arrival time, rather than feeding raw coordinates.',
    plainExplanation:
      'Feature engineering means creating helpful new columns or formatting existing ones (scaling numbers, encoding categories, removing useless IDs) so algorithms can easily find patterns.',
    whyInstructorsCare:
      'Models cannot read text categories without encoding, and arbitrary columns (like student_id) cause memorization if left in.',
    quickExample:
      'Fix: Drop identifier columns (df.drop(columns=["id"])) and scale continuous numeric features on the training set.',
  },
];

export const StudentLearningGuideModal: React.FC<StudentLearningGuideModalProps> = ({
  isOpen,
  onClose,
  initialTopic,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    initialTopic || 'data_leakage'
  );

  if (!isOpen) return null;

  const currentTopic = TOPICS.find((t) => t.id === selectedTopicId) || TOPICS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-neutral-100 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#833AB4] to-[#E1306C] text-white shadow-2xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-extrabold text-neutral-900">
                RubricAI Student Learning Guide
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                Data science concepts explained in plain English with everyday analogies.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content split view */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Sidebar topics list */}
          <div className="md:col-span-4 border-r border-neutral-100 overflow-y-auto p-4 space-y-1.5 bg-[#FAF9FC]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold px-2 block mb-2">
              Common Review Topics:
            </span>
            {TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`w-full text-left rounded-xl px-3.5 py-2.5 text-xs font-semibold transition flex items-center justify-between ${
                  selectedTopicId === topic.id
                    ? 'bg-white shadow-sm border border-[#833AB4]/30 text-[#833AB4]'
                    : 'text-neutral-600 hover:bg-white hover:text-neutral-900'
                }`}
              >
                <span>{topic.title}</span>
                {selectedTopicId === topic.id && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>

          {/* Topic Detail View */}
          <div className="md:col-span-8 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white">
            <div className="space-y-1 border-b border-neutral-100 pb-4">
              <span className="text-[11px] font-mono text-[#833AB4] uppercase font-bold">
                Concept Deep Dive
              </span>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900">
                {currentTopic.title}
              </h2>
            </div>

            {/* Analogy box */}
            <div className="rounded-2xl border border-amber-100 bg-[#FFFDF5] p-5 space-y-1 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                <Lightbulb className="h-4 w-4 text-[#F77737]" />
                <span>Everyday Analogy:</span>
              </div>
              <p className="text-amber-900 font-medium leading-relaxed text-xs pl-6 italic">
                "{currentTopic.simpleAnalogy}"
              </p>
            </div>

            {/* Plain explanation */}
            <div className="space-y-2 text-xs">
              <h4 className="font-display font-bold text-neutral-900 text-sm">What does it mean?</h4>
              <p className="text-neutral-600 leading-relaxed font-medium">
                {currentTopic.plainExplanation}
              </p>
            </div>

            {/* Why instructors care */}
            <div className="space-y-2 text-xs pt-3 border-t border-neutral-100">
              <h4 className="font-display font-bold text-neutral-900 text-sm">Why do instructors grade this?</h4>
              <p className="text-neutral-600 leading-relaxed font-medium">
                {currentTopic.whyInstructorsCare}
              </p>
            </div>

            {/* Quick solution example */}
            <div className="space-y-2 text-xs pt-3 border-t border-neutral-100">
              <h4 className="font-display font-bold text-neutral-900 text-sm">How to fix it in code:</h4>
              <pre className="rounded-2xl bg-neutral-900 p-4 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed shadow-inner">
                <code>{currentTopic.quickExample}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 bg-[#FAF9F5] px-6 py-3 flex items-center justify-between text-xs text-neutral-500">
          <span className="font-mono text-[11px]">
            RubricAI Student Education Center · Beginner Friendly
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
