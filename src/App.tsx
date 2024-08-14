import React, { FormEvent } from "react";
import logo from "./logo.svg";
import "./App.css";
import { useState, useEffect } from "react";

interface FormElements extends HTMLFormControlsCollection {
	engineDisplacement: HTMLInputElement;
	targetBoost: HTMLInputElement;
	revLimit: HTMLInputElement;
	volumetricEfficiency: HTMLInputElement;
}

function App() {
	const [results, setResults] = useState(<></>);

	function convertLitersToCI(engineSize: number) {
		return engineSize * 61.0237;
	}

	function calculateEngineCFM(
		engineSize: number,
		revLimit: number,
		volumetricEfficiency: number
	) {
		return (
			(convertLitersToCI(engineSize) * revLimit * 0.5 * volumetricEfficiency) /
			1728
		);
	}

	function calculateTurboModifier(boostTarget: number) {
		const atmos = 14.7;
		return (atmos + boostTarget) / atmos;
	}

	function getCFM(
		engineSize: number,
		revLimit: number,
		volumetricEfficiency: number,
		targetBoost: number
	) {
		return (
			calculateEngineCFM(engineSize, revLimit, volumetricEfficiency) *
			calculateTurboModifier(targetBoost)
		);
	}

	function getPipeCrossSectionalArea(dia: number) {
		return Math.PI * Math.pow(dia / 2 / 12, 2);
	}

	function getVelocity(
		dia: number,
		engineSize: number,
		revLimit: number,
		volumetricEfficiency: number,
		targetBoost: number
	) {
		return (
			getCFM(engineSize, revLimit, volumetricEfficiency, targetBoost) /
			getPipeCrossSectionalArea(dia) /
			60
		);
	}

	function calculateVelocityTable(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const elements: FormElements = (event.target as HTMLFormElement)
			.elements as FormElements;
		const displacement = parseFloat(elements.engineDisplacement.value);
		const targetBoost = parseFloat(elements.targetBoost.value);
		const revLimit = parseFloat(elements.revLimit.value);
		const volumetricEfficiency = parseFloat(
			elements.volumetricEfficiency.value
		);

		let rows = [];
		for (let dia = 1.5; dia <= 4.0; dia += 0.25) {
			let velocity = getVelocity(
				dia,
				displacement,
				revLimit,
				volumetricEfficiency,
				targetBoost
			);
			rows.push(
				<tr
					className={velocity >= 200 && velocity <= 300 ? "goodVelocity" : ""}
				>
					<td>{dia}</td>
					<td>{Math.round(velocity * 100) / 100}</td>
				</tr>
			);
		}

		let newResults = (
			<table>
				<thead>
					<tr>
						<th>Diameter (in)</th>
						<th>Velocity (fps)</th>
					</tr>
				</thead>
				<tbody className={"outputTable"}>{rows}</tbody>
			</table>
		);

		setResults(newResults);
	}

	return (
		<div className="pageBackground">
			<h1>Calculate ideal intercooler piping diameter</h1>
			<div className="pageContainer">
				<div className="pageColumn">
					<form
						onSubmit={(e) => calculateVelocityTable(e)}
						className="pageContainer"
					>
						<span>Engine Displacement (liters): </span>
						<input type={"number"} name={"engineDisplacement"} step={0.01} />

						<span>Target Boost (psi): </span>
						<input type={"number"} name={"targetBoost"} step={0.01} />

						<span>Max RPM: </span>
						<input type={"number"} name={"revLimit"} step={0.01} />

						<span>Volumetric Efficiency: </span>
						<input
							type={"number"}
							name={"volumetricEfficiency"}
							defaultValue={0.85}
							step={0.01}
						/>

						<button type={"submit"}>Calculate</button>
					</form>
				</div>

				<div className="pageColumn">{results}</div>
			</div>
		</div>
	);
}

export default App;
