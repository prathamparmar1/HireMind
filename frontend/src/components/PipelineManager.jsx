import { useState, useMemo } from "react";

function stageOf(candidate) {
  if (!candidate.extracted_skills) return "not_extracted";
  if (!candidate.match_score) return "extracted_not_matched";
  return "matched";
}

const STAGE_META = {
  not_extracted: {
    label: "Not yet extracted",
    hint: "Resume uploaded, but AI hasn't read it yet — usually because a previous run failed or quota ran out.",
    action: "Extract selected",
  },
  extracted_not_matched: {
    label: "Extracted, not scored",
    hint: "Profile is ready. Run matching to compare against this role and get a score.",
    action: "Match selected",
  },
};

function PipelineManager({ jobId, allCandidates, onExtract, onMatch, processing }) {
  const [selected, setSelected] = useState(new Set());
  const [openSection, setOpenSection] = useState("extracted_not_matched");

  const grouped = useMemo(() => {
    const groups = { not_extracted: [], extracted_not_matched: [], matched: [] };
    allCandidates.forEach((c) => groups[stageOf(c)].push(c));
    return groups;
  }, [allCandidates]);

  const pendingCount = grouped.not_extracted.length + grouped.extracted_not_matched.length;

  if (pendingCount === 0) {
    return null;
  }

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllInStage = (stageKey) => {
    const ids = grouped[stageKey].map((c) => c.id);
    const allSelected = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const runAction = (stageKey) => {
    const ids = grouped[stageKey].filter((c) => selected.has(c.id)).map((c) => c.id);
    if (ids.length === 0) return;

    if (stageKey === "not_extracted") {
      onExtract(ids);
    } else {
      onMatch(ids);
    }
    setSelected(new Set());
  };

  return (
    <div className="pipeline-manager">
      <div className="pipeline-manager-header">
        <span className="pm-title">Processing queue</span>
        <span className="pm-sub">
          {pendingCount} candidate{pendingCount !== 1 ? "s" : ""} not yet on the shortlist
        </span>
      </div>

      {["not_extracted", "extracted_not_matched"].map((stageKey) => {
        const group = grouped[stageKey];
        if (group.length === 0) return null;
        const meta = STAGE_META[stageKey];
        const isOpen = openSection === stageKey;
        const selectedInStage = group.filter((c) => selected.has(c.id)).length;
        const allSelected = selectedInStage === group.length;

        return (
          <div className="pm-stage" key={stageKey}>
            <button
              className="pm-stage-header"
              onClick={() => setOpenSection(isOpen ? null : stageKey)}
            >
              <span className={`pm-stage-dot dot-${stageKey}`} />
              <span className="pm-stage-label">{meta.label}</span>
              <span className="pm-stage-count">{group.length}</span>
              <span className="pm-stage-chevron">{isOpen ? "−" : "+"}</span>
            </button>

            {isOpen && (
              <div className="pm-stage-body">
                <p className="pm-stage-hint">{meta.hint}</p>

                <div className="pm-row pm-row-head">
                  <label className="pm-checkbox">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => toggleAllInStage(stageKey)}
                    />
                    <span>Select all ({group.length})</span>
                  </label>

                  <button
                    className="pm-action-btn"
                    disabled={selectedInStage === 0 || processing}
                    onClick={() => runAction(stageKey)}
                  >
                    {processing
                      ? "Processing..."
                      : `${meta.action} (${selectedInStage})`}
                  </button>
                </div>

                <div className="pm-candidate-rows">
                  {group.map((c) => (
                    <label className="pm-row" key={c.id}>
                      <span className="pm-checkbox">
                        <input
                          type="checkbox"
                          checked={selected.has(c.id)}
                          onChange={() => toggleOne(c.id)}
                        />
                      </span>
                      <span className="pm-candidate-name">
                        {c.name || `Candidate #${c.id}`}
                      </span>
                      <span className="pm-candidate-id">ID {c.id}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PipelineManager;
