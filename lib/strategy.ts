export type Settings = {
  totalCapitalUsd: number; baseOrderUsd: number; stepDropPct: number;
  takeProfitPct: number; maxExposurePct: number; weeklyTargetPct: number;
  minMinutesBetweenAlerts: number;
};
export const DEFAULTS: Settings = {
  totalCapitalUsd: 2500, baseOrderUsd: 100, stepDropPct: 6,
  takeProfitPct: 8, maxExposurePct: 40, weeklyTargetPct: 8,
  minMinutesBetweenAlerts: 10,
};
export function decideMinute(uniCad24h:number[], uniNowCad:number, uniNowUsd:number, btcSlopePct:number, s:Settings=DEFAULTS){
  const chgPct=((uniNowCad-uniCad24h[0])/uniCad24h[0])*100;
  const bias=Math.max(-1,Math.min(1,btcSlopePct/3)); const sizeAdj=1+bias*0.10;
  let action:'BUY'|'SELL'|'HOLD'='HOLD'; let reason=`UNI 24h ${chgPct.toFixed(2)}%, BTC ${btcSlopePct.toFixed(2)}%`;
  if(chgPct<=-s.stepDropPct){action='BUY';reason=`Dip ≥ ${s.stepDropPct}% → DCA buy`;}
  else if(chgPct>=s.takeProfitPct){action='SELL';reason=`Pop ≥ ${s.takeProfitPct}% → take-profit`;}
  const base=s.baseOrderUsd*sizeAdj; const maxBuyUsd=(s.totalCapitalUsd*s.maxExposurePct)/100;
  const suggestUsd=action==='BUY'?Math.min(base,maxBuyUsd):(action==='SELL'?base:0);
  return {action, suggestUsd:Math.max(0,Math.round(suggestUsd)),
    note:`${reason}. Size adj ${(sizeAdj*100-100).toFixed(1)}%. UNI CAD ${uniNowCad.toFixed(4)} / USD ${uniNowUsd.toFixed(4)}.`};
}
