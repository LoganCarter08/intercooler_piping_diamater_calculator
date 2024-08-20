import React, { FormEvent } from "react";
import logo from "./logo.svg";
import "./App.css";
import { useState, useEffect } from "react";

interface FormElements extends HTMLFormControlsCollection {
	targetHorsepower: HTMLInputElement;
	fuelType: HTMLInputElement;
	wallThickness: HTMLInputElement;
}

function App() {
	const [results, setResults] = useState(<></>);

	const fuelTypeEstimateValues = {
		pump: {
			bsfc: 0.46,
			afr: 11.5,
		},
		diesel: {
			bsfc: 0.36,
			afr: 18,
		},
		e85: {
			bsfc: 0.6,
			afr: 8.5,
		},
		methanol: {
			bsfc: 1.05,
			afr: 5,
		},
		race: {
			bsfc: 0.42,
			afr: 12.5,
		},
	};

	function getCFM(horsepower: number, afr: number, bsfc: number) {
		let airFlow = (horsepower * afr * bsfc) / 60;
		// 545 is 85f outside + 460 to get absolute temp and 13.949 is apparently the pressure standard
		// I'll link source shortly
		let cfm = (airFlow * 10.73 * 545) / (29 * 13.949);
		return cfm;
	}

	function getPipeCrossSectionalArea(dia: number) {
		return Math.PI * Math.pow(dia / 2 / 12, 2);
	}

	function getVelocity(cfm: number, dia: number) {
		return cfm / getPipeCrossSectionalArea(dia) / 60;
	}

	function calculateVelocityTable(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const elements: FormElements = (event.target as HTMLFormElement)
			.elements as FormElements;
		const fuelData =
			fuelTypeEstimateValues[
				elements.fuelType.value as keyof typeof fuelTypeEstimateValues
			];

		let cfm = getCFM(
			parseFloat(elements.targetHorsepower.value),
			fuelData.afr,
			fuelData.bsfc
		);

		let rows = [];
		for (let dia = 1.5; dia <= 4.0; dia += 0.25) {
			let velocity = getVelocity(
				cfm,
				dia - parseFloat(elements.wallThickness.value) * 2
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
					<form onSubmit={(e) => calculateVelocityTable(e)} className="form">
						<span>Target Horsepower: </span>
						<input
							type={"number"}
							name={"targetHorsepower"}
							step={0.01}
							required={true}
						/>

						<span>Fuel Type: </span>
						<select name={"fuelType"} required={true}>
							<option value="pump">Pump Gas</option>
							<option value="diesel">Diesel</option>
							<option value="e85">E85</option>
							<option value="meth">Methanol</option>
							<option value="race">Race Gas</option>
						</select>

						<span>Wall Thickness (inch): </span>
						<input
							type={"number"}
							name={"wallThickness"}
							defaultValue={0.065}
							step={0.001}
							required={true}
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
