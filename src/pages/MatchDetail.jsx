import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ChevronLeft, MapPin } from "lucide-react";
import Draft from "@/components/match/Draft";
import Toss from "@/components/match/Toss";
import OpeningSelection from "@/components/match/OpeningSelection";
import LiveScoring from "@/components/match/LiveScoring";
import Scorecard from "@/components/match/Scorecard";

const STATUS_LABEL = { draft: "Draft", toss: "Toss", live: "Live", completed: "Completed" };

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [players, setPlayers] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    base44.entities.Match.get(id).then(setMatch).catch(() => setMatch(false));
    base44.entities.Player.list("-created_date", 500).then(setPlayers).catch(() => {});
    base44.entities.BallEvent.filter({ match_id: id }, "created_date", 1000).then(setEvents).catch(() => {});
  }, [id]);

  if (match === null) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    );
  }
  if (match === false) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="font-medium">Match not found.</p>
        <Button asChild variant="outline">
          <Link to="/matches">Back to matches</Link>
        </Button>
      </div>
    );
  }

  const needsOpeners = match.status === "live" && !match.striker_id && !match.non_striker_id;
  const activePlayers = players.filter((p) => p.is_active !== false);
  const tossLine =
    match.toss_winner !== "pending" && match.toss_decision !== "pending"
      ? `${match.toss_winner === "a" ? match.team_a_name : match.team_b_name} won the toss and chose to ${
          match.toss_decision === "bat" ? "bat" : "field"
        }`
      : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-1 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Link to="/matches" className="mb-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-3.5 w-3.5" /> All matches
              </Link>
              <h1 className="text-lg font-bold sm:text-xl">{match.title}</h1>
              <p className="font-medium text-muted-foreground">
                {match.team_a_name} vs {match.team_b_name}
              </p>
            </div>
            <Badge variant={match.status === "live" ? "default" : "secondary"}>{STATUS_LABEL[match.status]}</Badge>
          </div>
          <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" /> {match.match_date} {match.start_time}
            </span>
            {match.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {match.venue}
              </span>
            )}
            <span>{match.overs_per_side} overs/side</span>
            <span>Credit cap {match.credit_cap}</span>
          </p>
          {tossLine && <p className="text-xs text-muted-foreground">{tossLine}</p>}
        </CardContent>
      </Card>

      {match.status === "draft" && <Draft match={match} players={activePlayers} onMatchUpdate={setMatch} />}
      {match.status === "toss" && <Toss match={match} onMatchUpdate={setMatch} />}
      {match.status === "live" &&
        (needsOpeners ? (
          <OpeningSelection
            match={match}
            players={players}
            onMatchUpdate={setMatch}
            dismissedIds={events.filter((e) => e.is_wicket).map((e) => e.out_batsman_id)}
          />
        ) : (
          <LiveScoring
            match={match}
            players={players}
            events={events}
            onMatchUpdate={setMatch}
            onEventAdded={(e) => setEvents((prev) => [...prev, e])}
          />
        ))}
 
