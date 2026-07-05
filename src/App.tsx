import { useStore } from './store'
import { computeVals } from './vals'
import { css } from './ui'
import { Lock } from './components/Lock'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { Board } from './screens/Board'
import { Visits } from './screens/Visits'
import { Intake } from './screens/Intake'
import { Questionnaires } from './screens/Questionnaires'
import { Vitals } from './screens/Vitals'
import { Labs } from './screens/Labs'
import { Evaluation } from './screens/Evaluation'
import { Workup } from './screens/Workup'
import { Talk } from './screens/Talk'
import { Summary } from './screens/Summary'
import { Admin } from './screens/Admin'

export function App() {
  const store = useStore()
  const v = computeVals(store)

  if (v.locked) return <Lock v={v} />

  return (
    <div
      onClick={v.onActivity}
      style={css("height:100vh;display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;color:#171810;background:#fcfbfb;overflow:hidden")}
    >
      <Header v={v} />
      <div style={css('flex:1;display:flex;min-height:0')}>
        <Sidebar v={v} />
        <div style={css('flex:1;overflow:auto;min-width:0')}>
          {v.sPatients && <Board v={v} />}
          {v.sVisits && <Visits v={v} />}
          {v.sIntake && <Intake v={v} />}
          {v.sQuest && <Questionnaires v={v} />}
          {v.sVitals && <Vitals v={v} />}
          {v.sLabs && <Labs v={v} />}
          {v.sEval && <Evaluation v={v} />}
          {v.sWorkup && <Workup v={v} />}
          {v.sTalk && <Talk v={v} />}
          {v.sSummary && <Summary v={v} />}
          {v.sAdmin && <Admin v={v} />}
        </div>
      </div>
    </div>
  )
}
