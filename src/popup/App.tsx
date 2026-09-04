import { usePopupState } from "./usePopupState";
import { SetupPrompt } from "./components/SetupPrompt";
import { AnalysisSummary } from "./components/AnalysisSummary";
import { FieldReviewRow } from "./components/FieldReviewRow";
import { CustomQuestionCard } from "./components/CustomQuestionCard";

export default function App() {
  const {
    loading,
    appState,
    analysis,
    analyzing,
    error,
    fillSummary,
    answers,
    analyze,
    fillHighConfidenceFields,
    fillSingleField,
    generateAnswer,
    editAnswer,
    insertAnswer,
    dismissAnswer,
  } = usePopupState();

  if (loading) {
    return <div className="p-6 text-sm text-slate-400">Loading…</div>;
  }

  const isReady = Boolean(appState?.hasProfile && appState?.hasApiKey);

  return (
    <div className="flex flex-col">
      <header className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
        <h1 className="text-sm font-semibold text-slate-800">AI Job Application Copilot</h1>
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          className="text-xs text-slate-400 hover:text-slate-600"
          title="Settings"
        >
          ⚙️
        </button>
      </header>

      {!isReady ? (
        <SetupPrompt hasProfile={Boolean(appState?.hasProfile)} hasApiKey={Boolean(appState?.hasApiKey)} />
      ) : (
        <div className="p-3 space-y-3 max-h-[560px] overflow-y-auto">
          {!analysis && (
            <button
              onClick={analyze}
              disabled={analyzing}
              className="w-full rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60 transition-colors"
            >
              {analyzing ? "Analyzing…" : "Analyze Application"}
            </button>
          )}

          {error && <p className="text-xs text-red-600 bg-red-50 rounded p-2">{error}</p>}

          {analysis && (
            <>
              <AnalysisSummary analysis={analysis} />

              <button
                onClick={analyze}
                disabled={analyzing}
                className="w-full rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                {analyzing ? "Re-analyzing…" : "Re-analyze this page"}
              </button>

              {analysis.fields.length === 0 && (
                <p className="text-xs text-slate-500">No fillable form fields were detected on this page.</p>
              )}

              {analysis.fields.length > 0 && (
                <button
                  onClick={fillHighConfidenceFields}
                  className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                >
                  Fill All High-Confidence Fields
                </button>
              )}

              {fillSummary && <p className="text-xs text-slate-600 bg-slate-100 rounded p-2">{fillSummary}</p>}

              {analysis.classifiedFields.some(
                (f) => f.classification.fieldType === "unknown" || f.classification.confidence < 0.75
              ) && (
                <section className="space-y-1.5">
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Review uncertain fields</h2>
                  {analysis.classifiedFields
                    .filter((f) => f.classification.fieldType === "unknown" || f.classification.confidence < 0.75)
                    .map((cf) => (
                      <FieldReviewRow
                        key={cf.field.fieldId}
                        classifiedField={cf}
                        onFill={(fieldType) => fillSingleField(cf.field, fieldType)}
                      />
                    ))}
                </section>
              )}

              {analysis.customQuestions.length > 0 && (
                <section className="space-y-1.5">
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Custom questions</h2>
                  {analysis.customQuestions.map((field) => (
                    <CustomQuestionCard
                      key={field.fieldId}
                      field={field}
                      answer={answers[field.fieldId]}
                      onGenerate={() => generateAnswer(field)}
                      onEdit={(text) => editAnswer(field.fieldId, text)}
                      onInsert={() => insertAnswer(field.fieldId)}
                      onDismiss={() => dismissAnswer(field.fieldId)}
                    />
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      )}

      <footer className="px-4 py-2 border-t border-slate-200 bg-white">
        <p className="text-[10px] text-slate-400">This extension never submits applications automatically.</p>
      </footer>
    </div>
  );
}
